import { Component, OnInit } from '@angular/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { LoadingController } from '@ionic/angular'
import { Storage } from '@ionic/storage-angular'

const IMAGE_DIR = 'stored-images';
const AUDIO_DIR = 'stored-audios';

interface LocalFile {
  name: string,
  path: string,
  data: string
}

@Component({
  selector: 'app-actions',
  templateUrl: './actions.page.html',
  styleUrls: ['./actions.page.scss'],
})
export class ActionsPage implements OnInit {

  storedFileNames = [];
  images: LocalFile[] = [];
  audios: LocalFile[] = [];

  acts : Array<object> = [];

  constructor(private loadingCtrl: LoadingController, private storage: Storage) { }

  ngOnInit() {
    this.loadFiles();
    this.loadAudios();
    this.getActs();
  }

  // get actions
  async getActs() {
    this.storage.forEach((_value,_key,_iterationNumber) => {
      this.acts.push({title:_value.title,date:_value.date,descrip:_value.descrip});
    });
  }

  async loadAudios() {
    this.audios = []
    Filesystem.readdir({
      path: AUDIO_DIR,
      directory: Directory.Data,
    }).then( result => {
      this.storedFileNames = result.files;
      // this.audios= result.files;
    }, async () => {
      await Filesystem.mkdir({
        directory: Directory.Data,
        path: AUDIO_DIR
      });
    })
  }

  async playFile(fileName:string) : Promise<void> {
    const audioFile = await Filesystem.readFile({
      path: `${AUDIO_DIR}/${fileName}`,
      directory: Directory.Data
    });
    const base64Sound = audioFile.data;
    const audioRef = new Audio(`data:audio/aac;base64,${base64Sound}`);
    audioRef.oncanplaythrough = () => audioRef.play();
    audioRef.load();
  }

  // get images
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
      // console.log('result', result);
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
      // console.log('READ: ', readFile)
    }
  }

  async loadFileDataAudio(fileNames: string[]) {
    for (let f of fileNames) {
      const filePath = `${AUDIO_DIR}/${f}`;
      const readFile = await Filesystem.readFile({
        directory: Directory.Data,
        path: filePath
      });
      this.audios.push({
        name: f,
        path: filePath,
        data: `data:audio/aac;base64,${readFile.data}`
      });
      // console.log('READ: ', readFile)
    }
  }

  async deleteImage( file: LocalFile ) {
    await Filesystem.deleteFile({
      directory: Directory.Data,
      path: file.path
    });
    this.loadFiles();    
  }

  async deleteAllData() {
    await this.storage.clear();
    await Filesystem.rmdir({
      path: IMAGE_DIR,
      directory: Directory.Data,
      recursive: true
    });
    await Filesystem.rmdir({
      path: AUDIO_DIR,
      directory: Directory.Data,
      recursive: true
    });
    // this.ngOnInit();
    await this.loadAudios();
    await this.loadFiles();
    await this.getActs();
  }
  
}
