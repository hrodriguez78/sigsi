import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const apiDuration = new Trend('api_duration');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // ramp up
    { duration: '1m', target: 20 },     // sustained load
    { duration: '30s', target: 50 },    // peak
    { duration: '1m', target: 20 },     // recovery
    { duration: '30s', target: 0 },     // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    errors: ['rate<0.1'],
  },
};

function getToken() {
  const loginRes = http.post(`${BASE_URL}/api/v1/auth/login`, JSON.stringify({
    email: 'admin@sgi.local',
    password: 'Admin123!',
  }), { headers: { 'Content-Type': 'application/json' } });

  const start = Date.now();
  check(loginRes, {
    'login status 200': (r) => r.status === 200,
    'login has token': (r) => r.json('access_token') !== undefined,
  });
  loginDuration.add(Date.now() - start);
  errorRate.add(loginRes.status !== 200);

  return loginRes.json('access_token') || '';
}

function authHeaders(token) {
  return { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } };
}

export default function () {
  const token = getToken();
  if (!token) return;

  const headers = authHeaders(token);

  // Health check
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, { 'health 200': (r) => r.status === 200 });

  // Dashboard stats
  let res = http.get(`${BASE_URL}/api/v1/dashboard/stats`, headers);
  check(res, { 'dashboard stats 200': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  apiDuration.add(res.timings.duration);

  sleep(0.5);

  // Dashboard KPIs
  res = http.get(`${BASE_URL}/api/v1/dashboard/kpis`, headers);
  check(res, { 'dashboard kpis 200': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);

  sleep(0.5);

  // List organizations
  res = http.get(`${BASE_URL}/api/v1/organizations`, headers);
  check(res, { 'list orgs 200': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);

  sleep(0.3);

  // List risks
  res = http.get(`${BASE_URL}/api/v1/risks`, headers);
  check(res, { 'list risks 200': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);

  sleep(0.3);

  // List controls
  res = http.get(`${BASE_URL}/api/v1/controls`, headers);
  check(res, { 'list controls 200': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);

  sleep(0.3);

  // List incidents
  res = http.get(`${BASE_URL}/api/v1/incidents`, headers);
  check(res, { 'list incidents 200': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);

  sleep(0.3);

  // Widget layout
  res = http.get(`${BASE_URL}/api/v1/widgets/layout`, headers);
  check(res, { 'widget layout 200': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);

  sleep(0.5);
}

export function handleSummary(data) {
  return {
    'performance/summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, opts) {
  const metrics = data.metrics;
  let output = '\n=== SGI Load Test Results ===\n\n';
  output += `Total requests: ${metrics.http_reqs?.values?.count || 0}\n`;
  output += `Avg response time: ${metrics.http_req_duration?.values?.avg?.toFixed(2) || 0}ms\n`;
  output += `p95 response time: ${metrics.http_req_duration?.values?.['p(95)']?.toFixed(2) || 0}ms\n`;
  output += `Max response time: ${metrics.http_req_duration?.values?.max?.toFixed(2) || 0}ms\n`;
  output += `Error rate: ${((metrics.errors?.values?.rate || 0) * 100).toFixed(2)}%\n`;
  output += `Requests/sec: ${metrics.http_reqs?.values?.rate?.toFixed(2) || 0}\n`;
  return output;
}
