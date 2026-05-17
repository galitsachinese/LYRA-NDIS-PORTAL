import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terms-modal.component.html',
  styleUrls: ['./terms-modal.component.scss']
})
export class TermsModalComponent {
  @Output() close = new EventEmitter<void>();

  isOpen = false;

  openModal() {
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isOpen = false;
    document.body.style.overflow = '';
    this.close.emit();
  }
}