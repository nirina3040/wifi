// safe-url.pipe.ts
import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl'
})
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  
  transform(value: any): SafeUrl {
    if (!value) return '';
    return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(value));
  }
}