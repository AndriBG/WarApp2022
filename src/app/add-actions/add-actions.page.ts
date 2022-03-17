import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { LoadingController, Platform } from '@ionic/angular';
import { ModalController } from '@ionic/angular'
import { RecordingData, VoiceRecorder } from 'capacitor-voice-recorder';
import { Storage } from '@ionic/storage-angular';

const IMAGE_DIR = 'stored-images';

interface LocalFile {
  name: string,
  path: string,
  data: string
}
@Component({
  selector: 'app-add-actions',
  templateUrl: './add-actions.page.html',
  styleUrls: ['./add-actions.page.scss'],
})
export class AddActionsPage implements OnInit {

  title : string;
  date: string;
  descrip: string;

  recording = false;
  images: LocalFile[] = [];

  constructor(private platform: Platform, private loadingCtrl: LoadingController,private storage: Storage) {}

  async ngOnInit() {
    await this.storage.create();
    VoiceRecorder.requestAudioRecordingPermission();
  }

  saveAction(){
    this.set('title', this.title);
    this.set('date', this.date);
    this.set('descrip', this.descrip);
  }

  public set(key: string, value: any) {
    this.storage.set(key, value);
  }

  startRecording () {
    if(this.recording) {
      return;
    }
    this.recording = true;
    VoiceRecorder.startRecording();
  }

  stopRecording () {
    if(!this.recording) {
      return ;
    }
    VoiceRecorder.stopRecording().then(async (result: RecordingData) => {
      if(result.value && result.value.recordDataBase64) {
        const recordData = result.value.recordDataBase64;
        const fileName = new Date().getTime() + '.wav';
        await Filesystem.writeFile({
          path: fileName,
          directory: Directory.Data,
          data: recordData
        });
        // this.loadFiles();
        // this.loadAudios();
      }
    });
  }

  async selectImage () {
    try {
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
    } catch(error){
      console.log(error)
    }

  }

  async saveImage(photo: Photo)  {
    const base64Data = await this.readAsBase64(photo);
    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      directory: Directory.Data,
      path: `${IMAGE_DIR}/${fileName}`,
      data: base64Data
    });
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

  async deleteImage( file: LocalFile ) {
    await Filesystem.deleteFile({
      directory: Directory.Data,
      path: file.path
    });
  }

  // upload the
  async startUpload( file: LocalFile ){

  }
}
