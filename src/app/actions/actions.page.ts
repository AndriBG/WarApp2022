import { Component, OnInit } from '@angular/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { LoadingController, ModalController } from '@ionic/angular'

const IMAGE_DIR = 'stored-images';

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
  acts : Array<object> = [];

  constructor(private loadingCtrl: LoadingController, private storage: Storage) { }

  ngOnInit() {
    this.loadFiles();
    this.loadAudios();
    // this.getActs();
  }

  async getActs() {
    const title = await this.storage.get('title');
    const date = await this.storage.get('date');
    const descrip = await this.storage.get('descrip');
    console.log(title,date,descrip)
  }

  loadAudios() {
    Filesystem.readdir({
      path: '',
      directory: Directory.Data,
    }).then( result => {
      this.storedFileNames = result.files;
    })
  }

  async playFile(fileName) {
    const audioFile = await Filesystem.readFile({
      path: fileName,
      directory: Directory.Data
    });
    const base64Sound = audioFile.data;
    const audioRef = new Audio(`data:audio/aac;base64,${base64Sound}`);
    audioRef.oncanplaythrough = () => audioRef.play();
    audioRef.load();
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

  async deleteImage( file: LocalFile ) {
    await Filesystem.deleteFile({
      directory: Directory.Data,
      path: file.path
    });
  }
}
