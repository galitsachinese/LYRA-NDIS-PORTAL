import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  ViewEncapsulation,
  HostBinding,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-slideshow',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div
      class="slideshow-container"
      style="width: 100%; height: 100%; overflow: hidden; position: relative;"
    >
      <div class="loading-placeholder" *ngIf="!isLoaded"></div>
      <img
        [src]="currentImage"
        [alt]="alt"
        class="slideshow-image"
        [class.loaded]="isLoaded"
        (load)="onImageLoad()"
        (error)="onImageError()"
        loading="eager"
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; display: block;"
      />
    </div>
  `,
  styles: [
    `
      app-slideshow {
        display: block;
        width: 100%;
        height: 100%;
      }

      .slideshow-container {
        width: 100%;
        height: 100%;
        overflow: hidden;
        position: relative;
      }

      .loading-placeholder {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          #e0e0e0 25%,
          #f0f0f0 50%,
          #e0e0e0 75%
        );
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        z-index: 1;
      }

      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      .slideshow-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        opacity: 0;
        transition: opacity 0.8s ease-in-out;
        z-index: 2;
      }

      .slideshow-image.loaded {
        opacity: 1;
        animation: fadeInOut 0.8s ease-in-out;
      }

      @keyframes fadeInOut {
        0% {
          opacity: 0.8;
        }
        100% {
          opacity: 1;
        }
      }
    `,
  ],
})
export class SlideshowComponent implements OnInit, OnDestroy {
  @Input() images: string[] = [];
  @Input() interval: number = 5000; // milliseconds
  @Input() alt: string = 'Slideshow image';

  @HostBinding('style.display') display = 'block';
  @HostBinding('style.width') width = '100%';
  @HostBinding('style.height') height = '100%';

  currentImage: string = '';
  isLoaded: boolean = false;
  private currentIndex = 0;
  private slideshowInterval: any;
  private preloadedImages: Map<string, HTMLImageElement> = new Map();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (this.images.length === 0) {
      console.warn('Slideshow: No images provided');
      return;
    }

    this.currentImage = this.images[0];

    // Preload all images for smoother transitions
    this.preloadImages();

    // Only start slideshow in browser, not during SSR
    if (isPlatformBrowser(this.platformId)) {
      this.startSlideshow();
    }
  }

  ngOnDestroy() {
    this.stopSlideshow();
  }

  onImageLoad() {
    this.isLoaded = true;
  }

  onImageError() {
    console.error(`Slideshow: Failed to load image: ${this.currentImage}`);
    // Skip to next image on error
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.currentImage = this.images[this.currentIndex];
  }

  private preloadImages() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Preload all images in the background
    this.images.forEach((src) => {
      const img = new Image();
      img.src = src;
      this.preloadedImages.set(src, img);
    });
  }

  private startSlideshow() {
    // Clear any existing interval first
    this.stopSlideshow();

    this.slideshowInterval = setInterval(() => {
      this.isLoaded = false;
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
      this.currentImage = this.images[this.currentIndex];
    }, this.interval);
  }

  private stopSlideshow() {
    if (this.slideshowInterval) {
      clearInterval(this.slideshowInterval);
      this.slideshowInterval = null;
    }
  }
}
