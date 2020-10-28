import { Directive, Input, ViewContainerRef, OnChanges } from '@angular/core'
import { LoggerService } from '@ws-widget/utils'
import { NsWidgetResolver } from './widget-resolver.model'
import { WidgetResolverService } from './widget-resolver.service'

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[wsLoginResolverWidget]',
})
export class LoginResolverDirective implements OnChanges {
  @Input() wsLoginResolverWidget: NsWidgetResolver.IRenderConfigWithAnyData | null = null
  constructor(
    private viewContainerRef: ViewContainerRef,
    private widgetResolverSvc: WidgetResolverService,
    private logger: LoggerService,
  ) {}

  ngOnChanges() {
    // if (!this.widgetResolverSvc.isInitialized) {
      this.logger.info(
        'Widgets Registration Not Done. Used Before Initialization.',
        this.wsLoginResolverWidget,
      )
      // return
      if (this.wsLoginResolverWidget) {
        const compRef = this.widgetResolverSvc.loginResolveWidget(
          this.wsLoginResolverWidget,
          this.viewContainerRef,
        )
        if (compRef) {
          compRef.changeDetectorRef.detectChanges()
        }
      }
    // }
  }
}
