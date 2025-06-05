# OpenMRS Patient Imaging Module (Orthanc Integration)

## Overview
In order to bring advanced imaging capabilities to OpenMRS. We have developed an integration with Orthanc Picture Archiving and Communication System (PACS). The OpenMRS OpenMRS ``Imaging`` module introduces a solution for managing medical imaging workflows, including DICOM uploads, visualisation, and worklist coordination, through both front-end and back-end components. By connecting OpenMRS with Orthanc, this module provides powerful imaging support without the need of the RIS.


- The **frontend** provides a UI managing imaging requests and visualizating image data.
- The **backend** module connects OpenMRS with one or more **Orthanc DICOM servers**, handling DICOM uploads, image metadata, and imaging procedure worklists.
- This integration does **not require a RIS system**, making it suitable for clinics and smaller facilities.

Watch the video demonstration of the module for OpenMRS 2.x here: [![Watch the video]()](https://youtu.be/no3WNaq4Q_M


Watch the video demonstration of the module for OpenMRS 3.x here: [![Watch the video]()](https://youtu.be/no3WNaq4Q_M)

![The worlist workflow](./src/assets/worklist_workflow.png)

This diagram illustrates the workflow of the worklist:
- A radiologist wants to view the worklist generated in OpenMRS via C-FIND Rest API
URL. 
- The Orthanc server forwards the request to OpenMRS. 
- OpenMRS processes the request and returns the worklist in JSON format. 
- The Orthanc plugin function ``Onworklsit`` reads the data and generates the worklist in DICOM format. 
- The results can be viewed with the command like 

    ```bash
    findscu -v -W -k "ScheduledProcedureStepSequence[0].Modality=CT" 127.0.0.1 4242
    ```
- Once the radiologist performs the procedure, a new DICOM study is created and uploaded to the Orthanc server. 
- The Orthanc plugin observes the new study using the OnChange function, notifies OpenMRS to update the worklist status and marks the associated procedure step as `completed`.


## Supported Versions

- **OpenMRS 3.x**: Modern React-based frontend
- **OpenMRS 2.x**: Legacy backend with module UI

## Prerequisites

- OpenMRS backend (2.x or 3.x compatible)
- Orthanc PACS server(s) and plugins
    - dicom-web
    - ohif
    - orthanc-explorer-2
    - python
    - stone-webviewer 
    - web-viewer 
    - worklist
    - wsi
- DCMTK tools (findscu for DICOM worklist testing)
- orthancworklist.py plugin (provided)

You can check the installed Orthanc's plugin here:

![The worlist workflow](./src/assets/orthanc_installed_plugins.png)

## Installation

1.  Orthanc installation: 
    - Download the Orthanc from here: https://orthanc.uclouvain.be/

2. OpenMRS Backend Moudle Setup

    - Download from GitHub: https://github.com/sadrezhao/openmrs-module-imaging/releases
    - Deploy:
        - For OpenMRS 2.x: Upload **.omod** via Manage Modules:

        Download our imaging backend OMOD module from https://github.com/sadrezhao/openmrs-module-imaging/releases, copy it to the module directory of your OpenMRS backend server, and start the server or OpenMRS is up and running, you can upload the new module (imaging-1.0.0-SNAPSHOT.omod) using the 'Add or Upgrade Module' option in Manage Modules.
        Please note that the upload may take some time. If deployed successfully, it should appear in the list of loaded modules on your server:

        ![The imaging module](./src/assets/imagingModule.png)

        - For OpenMRS 3.x: Use Maven:

        ```bash
            mvn clean install openmrs-sdk:run -DserverId=myserver
        ```

3. Frontend Setup (OpenMRS 3.x Only)
        
    - Setup on local(develop):

        ```bash
            git clone https://github.com/openmrs/openmrs-esm-patient-imaging-app.git

            cd openmrs-esm-patient-imaging-app
            
            yarn # Install frontend dependences

            # Start frontend
            npm start -- --backend http://OPENMRSHOST:OPENMRSPORT/

        ```
        Replace OPENMRSHOST and OPENMRSPORT with your backend address and port.
    
    - Set up on existing OpenMRS 3: 

        To set up the 'openmrs-patient-imaging-app' in your OpenMRS 3 installation (if you’re unable to find the Frontend settings):
        - Copy the directory `dist` from the package 'openmrs-esm-patient-imaging-app' to the directory `your-openmrs3-server/frontend/`
        - Then rename the folder with correct name: `openmrs-esm-patient-imaging-app-1.0.1-pre.1`
        - Navigate to the 'your-openmrs3-server/frontend/' directory and open the file `importmap.json`'
        - Add the following entry:
        
            ```bash
            @openmrs/esm-patient-imaging-app":"./openmrs-esm-patient-imaging-app-1.0.1-pre.1/openmrs-esm-patient-imaging-app.js
            ```
        - Navigate to the `your-openmrs3-server/frontend/` and open the `routes.registry.json`: 
            - Add following entry:

            ```bash
            @openmrs/esm-patient-imaging-app : all the content in the file route.json of the package 'openmrs-esm-patient-imaging-app'
            ```
        Then restart OpenMRS server

## Configuration

1. Configure Orthanc Server

The imaging backend module provides an REST API service that the Orthanc servers need to contact to query and update the worklist. Add the following lines to the configuration file of the Orthanc servers (typically the file `/etc/orthanc/orthanc.json`):

```bash
    "ImagingWorklistURL": "http://OPENMRSHOST:OPENMRSPORT/openmrs/ws/rest/v1/worklist/requests",   
    "ImagingUpdateRequestStatus": "http://OPENMRSHOST:OPENMRSPORT/openmrs/ws/rest/v1/worklist/updaterequeststatus",`
    "ImagingWorklistUsername" : "OPENMRSHOSTUSER",`  
    "ImagingWorklistPassword" : "OPENMRSHOSTPASSWORD"`
```

Replace OPENMRSHOST and OPENMRSPORT by the address and port of your OpenMRS backend server, and OPENMRSHOSTUSER and OPENMRSHOSTPASSWORD by the name and password of an user account on the OpenMRS server that you have created for the Orthanc servers.

2. Install Orthanc Plugin

    - The Orthanc servers act as worklist servers for the modalities. Our python plugin for Orthanc implements the needed functionality. Download the python script from https://github.com/sadrezhao/openmrs-module-imaging/blob/main/python/orthancWorklist.py.
    - Save it in a directory that is accessible by the Orthanc servers, for example in `/etc/orthanc`. 
    - Then add the following line to the python plugin configuration file of Orthanc (typically the file `python.json` in `/etc/orthanc`):

        ```bash
        "PythonScript": "/etc/orthanc/orthancWorklist.py"
        ```

    - Then restart the Orthanc server:

        ```bash
        sudo systemctl restart orthanc
        ```

3. Configure the connection to the Orthanc servers:
    You must provide connection settings (IP address, username, etc.) in order to allow OpenMRS to reach the Orthanc server(s). If the imaging module 
    has been correctly deployed, you can access the connection settings on the administration page of your OpenMRS server:

    ![Orthanc server configuration](./src/assets/orthancConfiguration.png)

4. Imaging Features:

    - Upload, view, assign and delete medical images:

    This is the heart of the Orthanc integration, allowing browsing and viewing of patient images through DICOM viewers available within Orthanc.
    The module retrieves the metadata of image studies stored on Orthan servers. A mapping function helps associating OpenMRS patient records with their
    corresponding studies. In addition, image data can be uploaded directly from the OpenMRS web client to Orthanc servers.

    - Create and manage imaging procedure requests:

    In the context of radiology, a worklist is a list of imaging studies or tasks that a radiologist needs to execute, review, or analyze.
    These tasks are typically retrieved from a radiology information system (RIS), a specialized database that manages patient and imaging information.
    However, in situations where an RIS system is not available or feasible (such as for smaller healthcare facilities, clinics, or specific locations), a simple radiology worklist can be sufficient.

    - Monitor status of DICOM  worklist tasks via Orthanc plugin:

    The Orthanc servers also act as DICOM worklist servers. Imaging procedure requests created in the frontend can be queried by modalities or the 
    radiology department from the Orthanc servers. When a DICOM study matching the ``PerformedProcedureStepID`` tag of a worklist procedure step is uploaded
    to an Orthanc server. the Orthanc server will notify the OpenMRS server and the status of the procedure step will change in the frontend.

    - Automatic status update on DICOM study upload:

    The Orthanc server will notify the OpenMRS server and the status of the procedure step will change in the frontend.


## Testing the Worklist

1. Create Imaging Requests
Use the frontend UI to create one or more imaging procedure requests for a patient.

2. Query Worklist via DCMTK
First, create some new imaging requests in the front end. The DCMTK findscu tool from https://support.dcmtk.org/docs/findscu.html allows to query the resulting 
DICOM worklists from the Orthanc server (replace 127.0.0.1 by the IP address of the Orthanc server):

```bash
  
  findscu -v -W -k "ScheduledProcedureStepSequence[0].Modality=CT" 127.0.0.1 4242     # Query by modality 

  findscu -v -W -k "PatientID=PatientUuid" 127.0.0.1 4242  # Query by patient data

  findscu -v -W -k "ScheduledProcedureStepSequence[0].RequestedProcedureDescription=xxx" 127.0.0.1 4242 # Query by requested procedure description

```
3. (Optional) Generate `.wl` File for Debugging

Uncomment the following lines in orthancWorklist.py:

``` bash
# This code only for test:`
  # Save the DICOM buffer to a file`
  # with open("/tmp/worklist_test.wl", 'wb') as f:
  # f.write(responseDicom)`
```
Then restart Orthanc

## Security

Make sure that the OpenMRS account used by Orthanc has the correct permissions and is restricted to the necessary imaging and worklist APIs only.

## Notification
To use the current `imaging` core module, you need to add three '.OMOD' modules because it supports two OpenMRS 2.x and OpenMRS 3.x. The required modules are:
- appframework-2.19.0-SNAPSHOT.omod
- appui-1.19.0-SNAPSHOT.omod
- uiframework-3.26.0-SNAPSHOT.omod

Note: future updates will remove these back-end dependencies and complete the configuration of the connection in OpenMRS 3.x.

## Repo Links

- Backend Module: https://github.com/sadrezhao/openmrs-module-imaging
- Frontend App: https://github.com/openmrs/openmrs-esm-patient-imaging-app
- Orthanc Worklist Plugin: https://github.com/sadrezhao/openmrs-module-imaging/blob/main/python/orthancWorklist.py







