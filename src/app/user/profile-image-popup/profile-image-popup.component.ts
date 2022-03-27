import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { catchError, map, of } from 'rxjs';
import { File } from 'src/app/articles/article.model';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { AuthService } from '../auth.service';
import { User } from '../user.model';

@Component({
  selector: 'app-profile-image-popup',
  templateUrl: './profile-image-popup.component.html',
  styleUrls: ['./profile-image-popup.component.css']
})
export class ProfileImagePopupComponent implements OnInit {
  public user!: User;
  public loading: boolean = false;
  public uploading = false;

  public file: File = {
    data: null,
    inProgress: false,
    progress: 0
  };


  constructor(
    public fileUploadService: FileUploadService,
    public dialogRef: MatDialogRef<ProfileImagePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public onFileSelected(event: any) {
    this.file = {
      data: <File>event.target.files[0],
      inProgress: false,
      progress: 0
    };

    this.uploadProfileImage();
  }


  uploadProfileImage(): void {
    // this.user.profilePicture = 'https://cdn.britannica.com/69/155469-131-14083F59/airplane-flight.jpg'

    this.uploading = true;
    const fileName = this.file.data.name

    this.file.inProgress = true;
    this.uploading = true;

    this.fileUploadService.uploadImage(fileName, this.file.data).pipe(
      map((event) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            this.file.progress = Math.round(event.loaded * 100 / event.total);
            break;
          case HttpEventType.Response:
            return event;
        }
      }),
      catchError((_error: HttpErrorResponse) => {
        this.file.inProgress = false;
        this.uploading = false;

        return of('Upload failed');
      })).subscribe((event: any) => {
        if (typeof (event) === 'object') {
          this.uploading = false;

          const formData = {
            "id": this.user?.id,
            "fullName": this.user?.fullName,
            "profilePicture": event.url,
            "profession": this.user?.profession,
            "bio": this.user?.bio,
            "language": "fr",
            "socialLinks": this.user?.socialLinks,
            "website": this.user?.website
          }

          this.authService.updateUserProfile(formData)
            .subscribe({
              next: (response: User) => {
                console.log('Profile image uploaded ! :', response);
                this.authService.setUserData(response)
              },
              error: (_err: HttpErrorResponse) => {
                console.log('Error uploading profile image');
              }
            })
        }
      })

  }

  deleteProfileImage(): void {
    this.loading = true;
  }

  ngOnInit(): void {
    this.user = this.authService?.currentUsr
    console.log('IMAGE MOUNTED');
  }
}

/**upload image to ovh and start loading
 * => if ok get the returned url and patch the user 
 * => if ok fetch the updated user (authService.getuser)
 * => if ok stop loading and assign the updated user to the previous user
 * => if ok, After popup close update the main page profile image with the updated user
 */