import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WidgetsState } from './widgets.reducer';

export const selectWidgetsState = createFeatureSelector<WidgetsState>('widgets');

export const selectLayout = createSelector(selectWidgetsState, (state) => state.layout);
export const selectWidgetsLoading = createSelector(selectWidgetsState, (state) => state.loading);
export const selectWidgetsError = createSelector(selectWidgetsState, (state) => state.error);

export const selectEnabledWidgets = createSelector(selectLayout, (layout) => {
  if (!layout) return [];
  return layout.widgets
    .filter((w) => w.enabled)
    .sort((a, b) => a.order - b.order);
});

export const selectWidgetById = (widgetId: string) =>
  createSelector(selectLayout, (layout) => {
    if (!layout) return null;
    return layout.widgets.find((w) => w.id === widgetId) || null;
  });

export const selectGridColumns = createSelector(selectLayout, (layout) =>
  layout?.columns || 4
);
