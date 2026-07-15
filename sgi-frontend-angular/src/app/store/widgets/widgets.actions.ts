import { createAction, props } from '@ngrx/store';
import { WidgetConfig, WidgetLayout } from '../../core/models';

export const loadLayout = createAction('[Widgets] Load Layout');
export const loadLayoutSuccess = createAction(
  '[Widgets] Load Layout Success',
  props<{ layout: WidgetLayout }>()
);
export const loadLayoutFailure = createAction(
  '[Widgets] Load Layout Failure',
  props<{ error: string }>()
);

export const updateLayout = createAction(
  '[Widgets] Update Layout',
  props<{ layout: Partial<WidgetLayout> }>()
);
export const updateLayoutSuccess = createAction(
  '[Widgets] Update Layout Success',
  props<{ layout: WidgetLayout }>()
);
export const updateLayoutFailure = createAction(
  '[Widgets] Update Layout Failure',
  props<{ error: string }>()
);

export const toggleWidget = createAction(
  '[Widgets] Toggle Widget',
  props<{ widgetId: string }>()
);

export const reorderWidgets = createAction(
  '[Widgets] Reorder Widgets',
  props<{ widgets: WidgetConfig[] }>()
);

export const updateWidget = createAction(
  '[Widgets] Update Widget',
  props<{ widgetId: string; changes: Partial<WidgetConfig> }>()
);

export const resetLayout = createAction('[Widgets] Reset Layout');
export const resetLayoutSuccess = createAction(
  '[Widgets] Reset Layout Success',
  props<{ layout: WidgetLayout }>()
);

export const setColumns = createAction(
  '[Widgets] Set Columns',
  props<{ columns: number }>()
);
