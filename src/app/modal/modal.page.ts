import { Component, Input, OnInit} from '@angular/core';
import { ModalController} from '@ionic/angular';

@Component({
  selector: 'modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})

export class ModalPage implements OnInit{

  @Input() descripcion: string;
  @Input() video: string;
  @Input() title: string;

  constructor(private  modalController: ModalController){}

  ngOnInit(): void {
    // document.getElementById('video_id').requestFullscreen();
  }

  dismiss() {
    this.modalController.dismiss({
      'dismissed': true
    })
  }

}