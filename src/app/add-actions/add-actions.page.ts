import { Component, OnInit } from '@angular/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { ModalController } from '@ionic/angular';
import { RecordingData, VoiceRecorder } from 'capacitor-voice-recorder';
import { ModalPage } from '../modal/modal.page'

@Component({
  selector: 'app-add-actions',
  templateUrl: './add-actions.page.html',
  styleUrls: ['./add-actions.page.scss'],
})
export class AddActionsPage implements OnInit {
  recording = false;
  storedFileNames = [];
  constructor(private modal : ModalController) { }

  ngOnInit() {
    this.loadFiles();
    VoiceRecorder.requestAudioRecordingPermission();
  }

  async loadFiles() {

    Filesystem.readdir({
      path: '',
      directory: Directory.Data
    }).then( result => {
      // console.log(result);
      this.storedFileNames = result.files;
    })
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
        this.loadFiles();
      }
    });
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

  async addAction() {
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
