import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export const options = {
  scenarios: {
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 100 },   // ramp to 100 VUs
        { duration: '2m', target: 100 },   // sustain 100 VUs
        { duration: '1m', target: 200 },   // spike to 200 VUs
        { duration: '2m', target: 200 },   // sustain spike
        { duration: '1m', target: 0 },     // ramp down
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<5000'],
    errors: ['rate<0.15'],
  },
};

export default function () {
  const loginRes = http.post(`${BASE_URL}/api/v1/auth/login`, JSON.stringify({
    email: 'admin@sgi.local',
    password: 'Admin123!',
  }), { headers: { 'Content-Type': 'application/json' } });

  check(loginRes, { 'login OK': (r) => r.status === 200 });
  errorRate.add(loginRes.status !== 200);

  if (loginRes.status === 200) {
    const token = loginRes.json('access_token');
    const headers = { headers: { 'Authorization': `Bearer ${token}` } };

    const endpoints = [
      '/api/v1/dashboard/stats',
      '/api/v1/dashboard/kpis',
      '/api/v1/organizations',
      '/api/v1/risks',
      '/api/v1/controls',
      '/api/v1/incidents',
      '/api/v1/widgets/layout',
    ];

    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    const res = http.get(`${BASE_URL}${endpoint}`, headers);
    check(res, { 'API OK': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
  }

  sleep(Math.random() * 2 + 0.5);
}
