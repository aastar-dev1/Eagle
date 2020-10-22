
import {
  Component,
  OnInit,
  ViewChild,
  ViewContainerRef,
  OnDestroy,
  Input,
} from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { NsWidgetResolver, WidgetBaseComponent } from '@ws-widget/resolver'
import {
  AuthKeycloakService} from '@ws-widget/utils'
import { MobileAppsService } from '../../services/mobile-apps.service'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import { ILoginDescriptiveFooterConfig, IWSPublicLoginConfig } from './login.model'
import { ConfigurationsService, NsPage } from '@ws-widget/utils'
import { Subscription } from 'rxjs'

@Component({
  selector: 'ws-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent extends WidgetBaseComponent
implements OnInit, OnDestroy, NsWidgetResolver.IWidgetData<NsPage.IPage | null> {
  objectKeys = Object.keys
  productLogo = ''
  contactUs = false
  productLogoWidth: string | undefined = ''
  showIconBackground = false
  developedBy = ''
  appIcon: SafeUrl | null = null
  // todo what to do for client login
  isClientLogin = false
  loginConfig: IWSPublicLoginConfig | null = null
  welcomeFooter: ILoginDescriptiveFooterConfig | null = null
  title = ''
  subTitle = ''
  private redirectUrl = ''
  private subscriptionLogin: Subscription | null = null
  pageLayout: any
  pageData: NsPage.IPage | null = null
  oldData: NsPage.IPage | null = null
  alreadyRaised = false
  error: any
  isXSmall = false

  routeChangeInProgress = false
  showNavbar = false
  currentUrl!: string
  isNavBarRequired = false
  isInIframe = false
  appStartRaised = false
  isSetupPage = false
  @ViewChild('previewContainer', { read: ViewContainerRef, static: true })
  previewContainerViewRef: ViewContainerRef | null = null
  @Input() widgetData: NsPage.IPage | null = null

  
  navBackground: Partial<NsPage.INavBackground> | null = null
  links: NsWidgetResolver.IRenderConfigWithTypedData<NsPage.INavLink>[] = []

  constructor(
    private activateRoute: ActivatedRoute,
    private authSvc: AuthKeycloakService,
    private configSvc: ConfigurationsService,
    private domSanitizer: DomSanitizer,
    private mobileAppsSvc: MobileAppsService,
  ) {
    super()
    this.mobileAppsSvc.init()
    const instanceConfig = this.configSvc.instanceConfig
    if (instanceConfig) {
      this.appIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
        instanceConfig.logos.appTransparent,
      )
      this.productLogo = instanceConfig.logos.company
      this.developedBy = instanceConfig.logos.developedBy
    }
  }

  ngOnInit() {
    this.subscriptionLogin = this.activateRoute.data.subscribe(data => {
      this.pageLayout = data.pageData.data.pageLayout
      // todo
      this.loginConfig = data.pageData.data
      this.isClientLogin = data.pageData.data.isClient
      this.welcomeFooter = data.pageData.data.footer.descriptiveFooter
      this.title = data.pageData.data.topbar.title
      this.subTitle = data.pageData.data.topbar.subTitle
      this.contactUs = data.pageData.data.footer.contactUs
    })

    const paramsMap = this.activateRoute.snapshot.queryParamMap
    if (paramsMap.has('ref')) {
      this.redirectUrl = document.baseURI + paramsMap.get('ref')
    } else {
      this.redirectUrl = document.baseURI
    }

    this.activateRoute.data.subscribe(routeData => {

    
      if (routeData.pageData && routeData.pageData.data) {
        this.error = null
        this.pageData = routeData.pageData.data
        if (this.pageData ) {
          this.navBackground = this.configSvc.pageNavBar
          this.links = this.isXSmall ? this.getNavLinks() : this.getNavLinks().filter(data =>
            data.widgetData.actionBtnId !== 'channel_how_to')
        }
      } else if (this.widgetData) {
        this.pageData = this.widgetData
        // if (this.pageData && this.pageData.navigationBar) {
        //   this.navBackground = this.pageData.navigationBar.background || this.configSvc.pageNavBar
        //   this.links = this.isXSmall ? this.getNavLinks() : this.getNavLinks().filter(data =>
        //     data.widgetData.actionBtnId !== 'channel_how_to')
        // }
      } else {
        this.pageData = null
        this.error = routeData.pageData.error
        // this.logger.warn('No page data available')
      }
      if (this.pageData) {
        this.oldData = this.pageData
        this.alreadyRaised = true
      }

    })
  }

  getNavLinks(): NsWidgetResolver.IRenderConfigWithTypedData<NsPage.INavLink>[] {
    if (this.pageData && this.pageData.navigationBar && Array.isArray(this.pageData.navigationBar.links)) {
      if (this.isXSmall) {
        return this.pageData.navigationBar.links.map(link => ({
          ...link,
          widgetData: {
            ...link.widgetData,
            config: {
              ...link.widgetData.config,
              type: 'mat-menu-item',
            },
          },
        }))
      }
      return this.pageData.navigationBar.links
    }
    return []
  }

  ngOnDestroy() {
    if (this.subscriptionLogin) {
      this.subscriptionLogin.unsubscribe()
    }
  }

  login(key: 'E' | 'N' | 'S') {
    this.authSvc.login(key, this.redirectUrl)
  }
}
