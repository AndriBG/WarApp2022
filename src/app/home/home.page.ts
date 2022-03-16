import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { LoadingController, Platform } from '@ionic/angular';
import { ModalController } from '@ionic/angular'
import { ModalPage } from '../modal/modal.page'

const IMAGE_DIR = 'stored-images';

interface LocalFile {
  name: string,
  path: string,
  data: string
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  images: LocalFile[] = [];
  // loading: any;

  constructor(private platform: Platform, private loadingCtrl: LoadingController,private modal : ModalController) {}

  async ngOnInit() {
    this.loadFiles();
  }

  async loadFiles() {
    this.images = [];
    const loading = await this.loadingCtrl.create({
      message: 'Loading Data'
    });

    await loading.present();

    Filesystem.readdir({
      directory: Directory.Data,
      path: IMAGE_DIR
    }).then( result => {
      console.log('result', result);
      this.loadFileData(result.files)
    }, async err => {
      console.error('error ', err);
      await Filesystem.mkdir({
        directory: Directory.Data,
        path: IMAGE_DIR
      });
    }).then( e => {
      loading.dismiss();
    });
  }

  async loadFileData(fileNames: string[]) {
    for (let f of fileNames) {
      const filePath = `${IMAGE_DIR}/${f}`;
      const readFile = await Filesystem.readFile({
        directory: Directory.Data,
        path: filePath
      });

      this.images.push({
        name: f,
        path: filePath,
        data: `data:image/jpeg;base64,${readFile.data}`
      });
      console.log('READ: ', readFile)
    }
  }

  async selectImage () {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });
    // console.log(image);
    if(image) {
      this.saveImage(image);
    }
  }

  async saveImage(photo: Photo) : Promise<void> {
    const base64Data = await this.readAsBase64(photo);
    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      directory: Directory.Data,
      path: `${IMAGE_DIR}/${fileName}`,
      data: base64Data
    });
    this.loadFiles();
  }

  private async readAsBase64(photo: Photo) {
    if(this.platform.is('hybrid')){
      const file = await Filesystem.readFile({
        path: photo.path
      });
      return file.data
    } else {
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();

      return await this.convertBlobToBase64(blob) as string;
    }

  }

  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  // upload the
  async startUpload( file: LocalFile ){

  }

  async deleteImage( file: LocalFile ) {
    await Filesystem.deleteFile({
      directory: Directory.Data,
      path: file.path
    });
    this.loadFiles();
  }

  async addAction(){
    const modal = await this.modal.create({
      component: ModalPage,
      // cssClass: 'my-custom-class',
      breakpoints: [0, 0.25, 0.5, 0.75, 1],
      keyboardClose: false,
      // handle: true,
      // htmlAttributes: ModalAttributes,
      // leaveAnimation:  (ba: any) => ,
      componentProps: {
        // video: e.video,
        // title: e.titulo,
        // descripcion: e.descripcion
      }
    });
    return await modal.present();
  }
}
