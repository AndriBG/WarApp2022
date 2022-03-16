import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular'
import { ModalPage } from '../modal/modal.page'
@Component({
  selector: 'app-actions',
  templateUrl: './actions.page.html',
  styleUrls: ['./actions.page.scss'],
})
export class ActionsPage implements OnInit {

  constructor(private modal : ModalController) { }

  ngOnInit() {
  }

  async addAction(e){
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
