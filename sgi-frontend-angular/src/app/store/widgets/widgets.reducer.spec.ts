import { widgetsReducer, initialState } from './widgets.reducer';
import * as WidgetsActions from './widgets.actions';

describe('WidgetsReducer', () => {
  it('should return initial state', () => {
    const state = widgetsReducer(undefined, { type: '@@init' });
    expect(state.loading).toBe(false);
    expect(state.layout).toBeNull();
    expect(state.error).toBeNull();
  });

  it('should set loading on loadLayout', () => {
    const state = widgetsReducer(initialState, WidgetsActions.loadLayout());
    expect(state.loading).toBe(true);
  });

  it('should store layout on loadLayoutSuccess', () => {
    const layout = {
      user_id: '1',
      widgets: [
        { id: 'w1', type: 'stat_card', title: 'Test', size: 'small' as const, enabled: true, order: 0 },
      ],
      columns: 3,
    };
    const state = widgetsReducer(initialState, WidgetsActions.loadLayoutSuccess({ layout }));
    expect(state.layout).toEqual(layout);
    expect(state.loading).toBe(false);
  });

  it('should toggle widget', () => {
    const layout = {
      user_id: '1',
      widgets: [
        { id: 'w1', type: 'stat_card', title: 'Test', size: 'small' as const, enabled: true, order: 0 },
      ],
      columns: 4,
    };
    const state = widgetsReducer(
      { ...initialState, layout },
      WidgetsActions.toggleWidget({ widgetId: 'w1' })
    );
    expect(state.layout!.widgets[0].enabled).toBe(false);
  });

  it('should reorder widgets', () => {
    const layout = {
      user_id: '1',
      widgets: [
        { id: 'w1', type: 'stat_card', title: 'A', size: 'small' as const, enabled: true, order: 0 },
        { id: 'w2', type: 'stat_card', title: 'B', size: 'small' as const, enabled: true, order: 1 },
      ],
      columns: 4,
    };
    const reordered = [
      { id: 'w2', type: 'stat_card', title: 'B', size: 'small' as const, enabled: true, order: 0 },
      { id: 'w1', type: 'stat_card', title: 'A', size: 'small' as const, enabled: true, order: 1 },
    ];
    const state = widgetsReducer(
      { ...initialState, layout },
      WidgetsActions.reorderWidgets({ widgets: reordered })
    );
    expect(state.layout!.widgets[0].id).toBe('w2');
    expect(state.layout!.widgets[1].id).toBe('w1');
  });

  it('should set columns', () => {
    const layout = { user_id: '1', widgets: [], columns: 4 };
    const state = widgetsReducer(
      { ...initialState, layout },
      WidgetsActions.setColumns({ columns: 2 })
    );
    expect(state.layout!.columns).toBe(2);
  });
});
