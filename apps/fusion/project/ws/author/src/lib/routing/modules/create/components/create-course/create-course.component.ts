import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms'
import { Component, OnInit, Input } from '@angular/core'
import { Router } from '@angular/router'
import { ICreateEntity } from '@ws/author/src/lib/interface/create-entity'
import { MatSnackBar, MatDialog } from '@angular/material'
import { LoaderService } from '@ws/author/src/lib/services/loader.service'
import { CreateService } from '../create/create.service'
import { NotificationComponent } from '@ws/author/src/lib/modules/shared/components/notification/notification.component'
import { ErrorParserComponent } from '@ws/author/src/lib/modules/shared/components/error-parser/error-parser.component'
import { NOTIFICATION_TIME } from '@ws/author/src/lib/constants/constant'
import { Notify } from '@ws/author/src/lib/constants/notificationMessage'
import { AuthInitService } from '@ws/author/src/lib/services/init.service'
import { AccessControlService } from '@ws/author/src/lib/modules/shared/services/access-control.service'

@Component({
  selector: 'ws-author-create-course',
  templateUrl: './create-course.component.html',
  styleUrls: ['./create-course.component.scss']
})
export class CreateCourseComponent implements OnInit {
  @Input() content: any

  language = ''
  entity: ICreateEntity[] = []
  resourceEntity!: ICreateEntity
  courseData: any

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar, private svc: CreateService,
              private router: Router,
              private loaderService: LoaderService, private dialog: MatDialog,
              private authInitService: AuthInitService,
              private accessControlSvc: AccessControlService) { }
  createCourseForm: FormGroup | undefined
  ngOnInit() {
    this.createCourseForm = this.fb.group({
      courseName: new FormControl('', [Validators.required]),
      courseIntroduction: new FormControl('', [Validators.required]),
      iprDeclaration: new FormControl('', [Validators.required]),
    })

    this.authInitService.creationEntity.forEach(v => {
      if (!v.parent && v.available) {
        if (v.id === 'resource') {
          this.resourceEntity = v
        } else {
          this.entity.push(v)
        }
      }
    })

    this.loaderService.changeLoadState(false)
    // this.allLanguages = this.authInitService.ordinals.subTitles || []
    this.language = this.accessControlSvc.locale

    const navigation = this.router.getCurrentNavigation()
    if (navigation && navigation.extras && navigation.extras.state) {
      this.content = navigation.extras.state
    }
 
    
  }

  contentClicked(content: ICreateEntity) {
    this.loaderService.changeLoad.next(true)
    this.svc
      .create({
        contentType: content.contentType,
        mimeType: content.mimeType,
        locale: this.language,
        courseName: this.courseData.courseName,
        courseIntro: this.courseData.courseIntroduction,
        ...(content.additionalMeta || {}),
      })
      .subscribe(
        (id: string) => {
          this.loaderService.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.CONTENT_CREATE_SUCCESS,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
          this.router.navigateByUrl(`/author/editor/${id}`, { state: this.courseData })
        },
        error => {
          if (error.status === 409) {
            this.dialog.open(ErrorParserComponent, {
              width: '80vw',
              height: '90vh',
              data: {
                errorFromBackendData: error.error,
              },
            })
          }
          this.loaderService.changeLoad.next(false)
          this.snackBar.openFromComponent(NotificationComponent, {
            data: {
              type: Notify.CONTENT_FAIL,
            },
            duration: NOTIFICATION_TIME * 1000,
          })
        },
      )
  }

  onSubmit(form: any) {
    console.log('form==>', form)
    this.courseData = form.value
    this.contentClicked(this.content)
  }

  navigateTo(params: string) {
    if (params === 'features') {
      this.router.navigate(['/app/features'])
    }
  }
}
