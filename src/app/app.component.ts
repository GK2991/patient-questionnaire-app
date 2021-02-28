import { Component, OnInit } from '@angular/core';
import { ApiService } from '../app/services/api-service.service';
import { timeInterval } from 'rxjs/operators';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  responseTime: number;
  disableSearch = false;
  patientsForm: FormGroup;

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.createFormGroup();
    this.apiService.getPatients().pipe(timeInterval()).subscribe((data: any) => {
      data.value.entry.forEach(value => {
        this.patientsformArr.push(this.generateFormGroup(value));
      });
      this.responseTime = data.interval;
      this.sortPatientsByDOB();
    });
  }

  createFormGroup() {
    this.patientsForm = this.fb.group({
      patientName: ['', Validators.pattern('^[a-zA-Z0-9_]*$')],
      birthDate: [''],
      details: this.fb.array([])
    });
  }

  get patientsformArr() {
    return this.patientsForm.get('details') as FormArray;
  }

  sortPatientsByDOB() {
    const patientsDetails = this.patientsForm.get('details') as FormArray;
    patientsDetails.controls.sort((a: any, b: any) => {
      return new Date(b.get('dob').value).valueOf() - new Date(a.get('dob').value).valueOf();
    });
  }

  searchByNameAndDate() {
    const params = {birthdate: this.patientsForm.value.birthDate, name: this.patientsForm.value.patientName};
    this.disableSearch = true;
    this.apiService.filterPatients(params).subscribe((data: any) => {
      if (data.entry) {
        this.patientsformArr.clear();
        data.entry.map((value: any) => {
          this.patientsformArr.push(this.generateFormGroup(value));
        });
      }
      this.disableSearch = false;
    });
  }

  private generateFormGroup(data) {
    return this.fb.group({
      id: [data.resource.id ],
      firstName: [data.resource.name[0].given[0] ],
      lastName: [data.resource.name[0].family ],
      gender: [data.resource.gender ],
      dob: [data.resource.birthDate ],
      resourceType: [data.resource.resourceType ]
    });
  }
}
