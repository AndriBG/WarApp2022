import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';
import { RecordingData, VoiceRecorder } from 'capacitor-voice-recorder';
import { Storage } from '@ionic/storage-angular';

const IMAGE_DIR = 'stored-images';
const AUDIO_DIR = 'stored-audios';

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

  constructor(private platform: Platform,private storage: Storage) {}

  async ngOnInit() {
    await this.storage.create();
    VoiceRecorder.requestAudioRecordingPermission();
    // encrytion way to storage data 
    // await this.storage.defineDriver(IonicSecureStorageDriver);
  }

  saveAction(){
    this.storage.set(`${new Date().getTime()}`, {title:this.title,date:this.date,descrip:this.descrip});
    this.title = '';
    this.date = '';
    this.descrip = '';
    // ecryption way to manage data
    // this.storage.setEncryptionKey('mykey');
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
        const fileName = `${AUDIO_DIR}/${new Date().getTime()}.wav`;
        await Filesystem.writeFile({
          path: fileName,
          directory: Directory.Data,
          data: recordData
        });
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

  // upload the
  async startUpload( file: LocalFile ){

  }


  // for encryption storage data
  // async migrateDatabase() {
  //   const origStore = new Storage({
  //     name: 'originalDB', // the original database name
  //     driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB, Drivers.LocalStorage]
  //   });
  //   await origStore.defineDriver(CordovaSQLiteDriver);
  
  //   const newStore = new Storage({
  //     name: 'encryptedDB', // pick a new db name for the encrypted db
  //     driverOrder: [Drivers.SecureStorage, Drivers.IndexedDB, Drivers.LocalStorage]
  //   });
  //   await newStore.defineDriver(IonicSecureStorageDriver);
  //   newStore.setEncryptionKey('mykey');
  
  //   if (await origStore.length() > 0) {
  //     // copy existing data into new, encrypted format
  //     await origStore.forEach((key, value, index) => {
  //       newStore.set(key, value);
  //     });
  
  //     // remove old data
  //     await origStore.clear();
  //   }
  
  //   this._storage = newStore;
  // }
}

