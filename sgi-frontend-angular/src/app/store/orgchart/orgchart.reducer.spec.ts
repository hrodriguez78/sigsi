import { orgchartReducer, initialState } from './orgchart.reducer';
import * as OrgChartActions from './orgchart.actions';

describe('OrgChartReducer', () => {
  it('should return initial state', () => {
    const state = orgchartReducer(undefined, { type: '@@init' });
    expect(state.tree).toBeNull();
    expect(state.positions).toEqual([]);
    expect(state.loading).toBe(false);
  });

  it('should set loading on loadOrgChart', () => {
    const state = orgchartReducer(initialState, OrgChartActions.loadOrgChart({ organizationId: 'org1' }));
    expect(state.loading).toBe(true);
  });

  it('should store tree and positions on success', () => {
    const tree = { id: '1', name: 'Director', level: 0, responsibilities: [], children: [] };
    const positions = [{ id: '1', name: 'Director', organization_id: 'org1', level: 0, order: 0, responsibilities: [], created_at: '', updated_at: '' }];
    const state = orgchartReducer(initialState, OrgChartActions.loadOrgChartSuccess({ tree, positions }));
    expect(state.tree).toEqual(tree);
    expect(state.positions.length).toBe(1);
    expect(state.loading).toBe(false);
  });

  it('should add position on createPositionSuccess', () => {
    const pos = { id: '2', name: 'Manager', organization_id: 'org1', level: 1, order: 0, responsibilities: [], created_at: '', updated_at: '' };
    const state = orgchartReducer(initialState, OrgChartActions.createPositionSuccess({ position: pos }));
    expect(state.positions.length).toBe(1);
    expect(state.positions[0].name).toBe('Manager');
  });

  it('should update position on updatePositionSuccess', () => {
    const existing = [{ id: '1', name: 'Old', organization_id: 'org1', level: 0, order: 0, responsibilities: [], created_at: '', updated_at: '' }];
    const updated = { id: '1', name: 'New', organization_id: 'org1', level: 0, order: 0, responsibilities: [], created_at: '', updated_at: '' };
    const state = orgchartReducer(
      { ...initialState, positions: existing },
      OrgChartActions.updatePositionSuccess({ position: updated })
    );
    expect(state.positions[0].name).toBe('New');
  });

  it('should remove position on deletePositionSuccess', () => {
    const existing = [{ id: '1', name: 'To Delete', organization_id: 'org1', level: 0, order: 0, responsibilities: [], created_at: '', updated_at: '' }];
    const state = orgchartReducer(
      { ...initialState, positions: existing },
      OrgChartActions.deletePositionSuccess({ id: '1' })
    );
    expect(state.positions.length).toBe(0);
  });

  it('should set selected position', () => {
    const state = orgchartReducer(initialState, OrgChartActions.setSelectedPosition({ positionId: '123' }));
    expect(state.selectedPositionId).toBe('123');
  });
});
