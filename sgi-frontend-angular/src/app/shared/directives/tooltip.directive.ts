import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
})
export class TooltipDirective {
  @Input('appTooltip') text = '';

  private tooltipEl: HTMLDivElement | null = null;

  constructor(private el: ElementRef) {}

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (!this.text) return;

    this.tooltipEl = document.createElement('div');
    this.tooltipEl.className = 'custom-tooltip';
    this.tooltipEl.textContent = this.text;
    document.body.appendChild(this.tooltipEl);

    const rect = this.el.nativeElement.getBoundingClientRect();
    this.tooltipEl.style.left = `${rect.left + rect.width / 2}px`;
    this.tooltipEl.style.top = `${rect.top - 8}px`;
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (this.tooltipEl) {
      this.tooltipEl.remove();
      this.tooltipEl = null;
    }
  }
}
