# OpenMRS Patient Imaging Module (Orthanc Integration)

## Overview
In order to bring advanced imaging capabilities to OpenMRS. We have developed an integration with the Picture Archiving and Communication System (PACS) [Orthanc](https://orthanc.uclouvain.be/). The OpenMRS ``Imaging`` module introduces a solution for managing medical imaging workflows, including DICOM uploads, visualisation, and worklist coordination, through both front-end and back-end components. By connecting OpenMRS with Orthanc, this module provides imaging support without the need of a RIS, making it suitable for smaller clinics and facilities.

The integration consists of three components:

- The **frontend** app provides a UI for managing imaging requests and  DICOM image data, including visualization.
- The **backend** module connects OpenMRS with one or more **Orthanc DICOM servers**, handling DICOM uploads, image metadata, and imaging procedure worklists.
- The **Orthanc plugin** translates worklist queries and responses between OpenMRS and the modality software.


Watch the demo video of the module for OpenMRS 2.x here: [Watch the video](https://youtu.be/no3WNaq4Q_M)

Watch the demo video of the module for OpenMRS 3.x here: [Watch the video](https://youtu.be/Z4MRPmkwHms)

## Repo Links

- Backend Module: https://github.com/sadrezhao/openmrs-module-imaging
- Frontend App: https://github.com/openmrs/openmrs-esm-patient-imaging-app
- Orthanc Worklist Plugin: https://github.com/sadrezhao/openmrs-module-imaging/blob/main/python/orthancWorklist.py

## Features

- **Upload, view, assign and delete medical images**:
This is the heart of the Orthanc integration, allowing browsing and viewing of patient images through DICOM viewers available within Orthanc.
The module retrieves the metadata of image studies stored on Orthan servers. A mapping function helps associating OpenMRS patient records with their
corresponding studies. In addition, image data can be uploaded directly from the OpenMRS web client to Orthanc servers.

- **Create and manage imaging procedure requests**:
In the context of radiology, a worklist is a list of imaging studies or tasks that a radiologist needs to execute, review, or analyze.
These tasks are typically retrieved from a radiology information system (RIS), a specialized database that manages patient and imaging information.
However, in situations where an RIS system is not available or feasible (such as for smaller healthcare facilities, clinics, or specific locations), a simple radiology worklist can be sufficient.

- **Monitor status of DICOM  worklist tasks via Orthanc plugin**:
The Orthanc servers also act as DICOM worklist servers. Imaging procedure requests created in the frontend can be queried by modalities or the 
radiology department from the Orthanc servers. When a DICOM study matching the ``PerformedProcedureStepID`` tag of a worklist procedure step is uploaded
to an Orthanc server. the Orthanc server will notify the OpenMRS server and the status of the procedure step will change in the frontend.

- **Automatic status update on DICOM study upload**:
The Orthanc server will notify the OpenMRS server and the status of the procedure step will change in the frontend.

## Workflow for worklists

![The worlist workflow](./src/assets/worklist_workflow.png)

This above diagram illustrates how worklists work:
1. A practitioner creates a request for an imaging procedure in the OpenMRS web GUI. The procedure can consist of multiple steps. The request is stored in OpenMRS' database.
1. A radiologist queries the list of requested procedures by sending a C-FIND query from their modality application to the Orthanc server. 
1. On the Orthanc server, the plugin translates and forwards the request to the backend module on the OpenMRS server. 
1. OpenMRS processes the request and returns the list of requested procedures in JSON format. 
1. The Orthanc plugin generates a response as a DICOM Modality Worklist and sends it to the modality application. 
1. When the radiologist has performed the requested procedure (or part of it), a new DICOM study is created and uploaded to the Orthanc server. 
- The Orthanc plugin notifies OpenMRS to update the status of the requested procedure. The procedure step corresponding to the uploaded DICOM study is marked as `completed`.

If you want to query the worklist manually, you can use the [`findscu`  command line tool](https://support.dcmtk.org/docs/findscu.html) where `XXXX` is the name or IP address of the Orthanc server: 

```bash
findscu -v -W -k "ScheduledProcedureStepSequence[0].Modality=CT" XXXX 4242
```



## Supported Versions

- **OpenMRS 3.x**: Modern React-based frontend ("micro frontend app")
- **OpenMRS 2.x**: Legacy backend with module UI (with gsp pages)

## Installation

### Orthanc

- Install Orthanc: https://orthanc.uclouvain.be/
- Verify that you have the required plugins installed:
    - dicom-web
    - ohif
        orthanc-explorer-2
    - python
    - stone-webviewer 
    - web-viewer 
    - worklist
    - wsi
![Orthanc plugins](./src/assets/orthanc_installed_plugins.png)

### OpenMRS backend module

- You need an OpenMRS 2 or 3 backend. Its installation is not described here.
The current implementation of the backend module supports OpenMRS 2.x and OpenMRS 3.x. For that reason, it has dependencies to the following OpenMRS 2 modules that you need on your backend:
    - appframework-2.19.0-SNAPSHOT.omod
    - appui-1.19.0-SNAPSHOT.omod
    - uiframework-3.26.0-SNAPSHOT.omod
    
    Future OPenMRS3-only versions will remove these back-end dependencies.


- Download the imaging backend module from GitHub: https://github.com/sadrezhao/openmrs-module-imaging/releases
- Deploy the module:
    Download the module from https://github.com/sadrezhao/openmrs-module-imaging/releases, and manually copy the omod file to the module directory of your OpenMRS backend server or upload it using `Manage Modules` configuration page.
    The activation of the module can take some time. If deployed successfully, it should appear in the list of loaded modules on your server: ![The imaging module](./src/assets/imagingModule.png)

- Developers can deploy the module in their SDK server with maven:
    ```bash
        mvn clean install openmrs-sdk:run -DserverId=myserver
    ```

### (Only for OpenMRS 3.x) OpenMRS micro frontend app 
   
We will not describe here how to create a new OpenMRS distribution for production deployment. For quickly testing the frontend, there are two ways:

- Running the frontend app locally:

    ```bash
        git clone https://github.com/openmrs/openmrs-esm-patient-imaging-app.git

        cd openmrs-esm-patient-imaging-app
        
        yarn # Install frontend dependences

        # Start frontend
        npm start -- --backend http://OPENMRSHOST:OPENMRSPORT/

    ```
    Replace OPENMRSHOST and OPENMRSPORT with your backend address and port.

- Deploying the frontend app in an existing OpenMRS 3 server for testing: 
    1. Copy the directory `dist` from the package 'openmrs-esm-patient-imaging-app' to the directory `your-openmrs3-server/frontend/`, then rename the `dist` folder to `openmrs-esm-patient-imaging-app-1.0.1-pre.1`
    1. Add the following entry to the file `your-openmrs3-server/frontend/importmap.json`:
        ```bash
        @openmrs/esm-patient-imaging-app":"./openmrs-esm-patient-imaging-app-1.0.1-pre.1/openmrs-esm-patient-imaging-app.js
        ```
    1. Create a new top-level key named `@openmrs/esm-patient-imaging-app` in the file `your-openmrs3-server/frontend/routes.registry.json`. For the value of the key, copy the entire content of the file `route.json` that is located in `openmrs-esm-patient-imaging-app-1.0.1-pre.1`
    1. Restart the OpenMRS server

## Configuring Orthanc

### Orthanc server

The imaging backend module provides an REST API service that the Orthanc servers needs to contact to query and update the worklist. Add the following lines to the configuration file of the Orthanc servers (typically the file `/etc/orthanc/orthanc.json`):

```bash
    "ImagingWorklistURL": "http://OPENMRSHOST:OPENMRSPORT/openmrs/ws/rest/v1/worklist/requests",   
    "ImagingUpdateRequestStatus": "http://OPENMRSHOST:OPENMRSPORT/openmrs/ws/rest/v1/worklist/updaterequeststatus",`
    "ImagingWorklistUsername" : "OPENMRSHOSTUSER",`  
    "ImagingWorklistPassword" : "OPENMRSHOSTPASSWORD"`
```

Replace OPENMRSHOST and OPENMRSPORT by the address and port of your OpenMRS backend server, and OPENMRSHOSTUSER and OPENMRSHOSTPASSWORD by the name and password of an user account on the OpenMRS server that Orthanc can use to access the API.

### Orthanc plugin

The Orthanc servers act as worklist servers for the modalities. Our python plugin for Orthanc implements the needed functionality.

1. Download the python script from https://github.com/sadrezhao/openmrs-module-imaging/blob/main/python/orthancWorklist.py and save it in a directory that is accessible by the Orthanc servers, for example in `/etc/orthanc`
1. Add the following line to the python plugin configuration file of Orthanc (typically the file `python.json` in `/etc/orthanc`):
    ```bash
    "PythonScript": "/etc/orthanc/orthancWorklist.py"
    ```
1. Restart the Orthanc server:

    ```bash
    sudo systemctl restart orthanc
    ```

1. Configure the connection to the Orthanc servers:
    You must provide connection settings (IP address, username, etc.) in order to allow OpenMRS to reach the Orthanc server(s). If the imaging module 
    has been correctly deployed, you can access the connection settings on the administration page of your OpenMRS server:

    ![Orthanc server configuration](./src/assets/orthancConfiguration.png)

## Security

Make sure that the OpenMRS account used by Orthanc has the correct permissions and is restricted to the necessary imaging and worklist APIs only.


## Testing the Worklist

- Create Imaging Requests:
Use the frontend UI to create one or more imaging procedure requests for a patient.

- Query Worklist via DCMTK:
First, create some new imaging requests in the front end. The DCMTK findscu tool from https://support.dcmtk.org/docs/findscu.html allows to query the resulting 
DICOM worklists from the Orthanc server (replace 127.0.0.1 by the IP address of the Orthanc server):

```bash
  
  findscu -v -W -k "ScheduledProcedureStepSequence[0].Modality=CT" 127.0.0.1 4242     # Query by modality 

  findscu -v -W -k "PatientID=PatientUuid" 127.0.0.1 4242  # Query by patient data

  findscu -v -W -k "ScheduledProcedureStepSequence[0].RequestedProcedureDescription=xxx" 127.0.0.1 4242 # Query by requested procedure description

```
- (Optional) Generate `.wl` File for Debugging: Uncomment the following lines in orthancWorklist.py and restart Orthanc:

``` bash
# This code only for test:
  # Save the DICOM buffer to a file
  # with open("/tmp/worklist_test.wl", 'wb') as f:
  # f.write(responseDicom)
```

## Testing the module

### Run unit and integration tests:

```bash
npm run test
```

### Run end-to-end (E2E) tests:

Before running end-to-end (E2E) tests, ensure that you have the following set up:
> - **Orthanc Server** installed and running — ensure it contains **no image data**.
> - **Imaging` backend server** is started.
> - **OpenMRS3.x frontend** is running:  

```bash
npm start -- --backend http://localhost:YOUR-BACKEND-PORT/
```
> - **Orthanc configuration** is correctly added to your environment.

This project provides the `start-e2e.sh` helper script to start the E2E test suite.

**Run a single suite**

```bash
export E2E_BASE_URL=http://localhost:YOUR-BACKEND-PORT/openmrs
./start-e2e.sh e2e/specs/imaging-detailed-summary.component.spec.ts
```

**Run E2E test suites**

```bash
export E2E_BASE_URL=http://localhost:YOUR-BACKEND-PORT/openmrs
./start-e2a.sh
```

Clean up the previous test results and reports to avoid confusion or clutter:
```bash
rm -rf test-results/ playwright-report/
```

## Docker Project for This Module
The Docker setup for this module, including the microfrontend for OpenMRS 3.x, is available here: 
https://github.com/sadrezhao/openmrs-imaging-docker












