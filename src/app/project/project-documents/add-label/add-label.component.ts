import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, FormArray, NgForm, ReactiveFormsModule } from '@angular/forms';

import { DocumentService } from 'app/services/document.service';

@Component({
  selector: 'app-add-label',
  templateUrl: './add-label.component.html',
  styleUrls: ['./add-label.component.scss']
})
export class AddLabelComponent implements OnInit {
  public currentProjectId: string;
  public myForm: FormGroup;
  public labels: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private documentService: DocumentService
  ) { }

  ngOnInit() {
    this.route.parent.paramMap.subscribe(params => {
      this.currentProjectId = params.get('projId');
    });

    this.myForm = new FormGroup({
      'doctypesel': new FormControl(),
      'authorsel': new FormControl(),
      'labelsel': new FormControl(),
      'milestonesel': new FormControl(),
      'documentDate': new FormControl(),
      'uploadDate': new FormControl(),
      'documentName': new FormControl(),
      'description': new FormControl()
    });

    this.labels = this.documentService.state.labels;
  }

  toggleSelected(label: any) {
    label.selected = !label.selected;
    this.documentService.state.labels = this.labels;
  }

  register (myForm: FormGroup) {
    console.log('Successful registration');
    console.log(myForm);
  }

  cancel() {
    this.router.navigate(['p', this.currentProjectId, 'project-documents', 'upload']);
  }
}
