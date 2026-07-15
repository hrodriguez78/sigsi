import { createReducer, on } from '@ngrx/store';
import { WidgetLayout, WidgetConfig } from '../../core/models';
import * as WidgetsActions from './widgets.actions';

export interface WidgetsState {
  layout: WidgetLayout | null;
  loading: boolean;
  error: string | null;
}

export const initialState: WidgetsState = {
  layout: null,
  loading: false,
  error: null,
};

export const widgetsReducer = createReducer(
  initialState,
  on(WidgetsActions.loadLayout, (state) => ({ ...state, loading: true, error: null })),
  on(WidgetsActions.loadLayoutSuccess, (state, { layout }) => ({
    ...state,
    layout,
    loading: false,
  })),
  on(WidgetsActions.loadLayoutFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(WidgetsActions.updateLayoutSuccess, (state, { layout }) => ({
    ...state,
    layout,
  })),
  on(WidgetsActions.updateLayoutFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(WidgetsActions.toggleWidget, (state, { widgetId }) => {
    if (!state.layout) return state;
    const widgets = state.layout.widgets.map((w) =>
      w.id === widgetId ? { ...w, enabled: !w.enabled } : w
    );
    return { ...state, layout: { ...state.layout, widgets } };
  }),
  on(WidgetsActions.reorderWidgets, (state, { widgets }) => {
    if (!state.layout) return state;
    const reordered = widgets.map((w, i) => ({ ...w, order: i }));
    return { ...state, layout: { ...state.layout, widgets: reordered } };
  }),
  on(WidgetsActions.updateWidget, (state, { widgetId, changes }) => {
    if (!state.layout) return state;
    const widgets = state.layout.widgets.map((w) =>
      w.id === widgetId ? { ...w, ...changes } : w
    );
    return { ...state, layout: { ...state.layout, widgets } };
  }),
  on(WidgetsActions.resetLayoutSuccess, (state, { layout }) => ({
    ...state,
    layout,
  })),
  on(WidgetsActions.setColumns, (state, { columns }) => {
    if (!state.layout) return state;
    return { ...state, layout: { ...state.layout, columns } };
  })
);
