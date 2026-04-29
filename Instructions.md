# National Institute of Business Management  
## School of Computing and Engineering Coursework | Assessment Announcement Sheet  

### Course Details
| Field | Value |
|-------|-------|
| Course Name | BSc (Hons) Computing (awarded by Coventry University) |
| Module Name | NB6007CEM - Web API Development |
| Batch | 24.2P |
| Module Lecturer | Niranga Dharmaratna |
| Assessment Setter | Niranga Dharmaratna |

### Learning Outcomes
1. Develop a secure, open-standards-based API to support server-client communication.  
2. Create modern web content involving asynchronous data retrieval, client-side DOM manipulation, standards adherence, and user-user interaction.  
3. Manage data persistence across both server and client web-based solutions.  
4. Design and implement an API and client based on given, non-trivial requirements using a range of appropriate developer tools.  

---

## Assessment Details
- **Assessment No**: 1 (100%)  
- **Assessment Mode**: Individual | Group  
- **Assessment Type**: Practical Test | Report | Software | Presentation | VIVA | MCQ  
- **Submission**: See section Assessment.  

Assesment | CW Description

## Business Case : Real-Time Three-Wheeler (Tuk-Tuk) Tracking & Movement Logging System for Law Enforcement (Sri Lanka)  

- Sri lanka Police, together with relavant law enforcement agencies, will develope a Centralized, real-time tuk-tuk(three-wheeler) tracking platform to support opeartional visibilty and investigations. The system will collect GPS-based location pings from registered three-wheelers and provide.  
  - Last-known real-time location (live view)  
  - Historical movement logs (time-window tracking)  
  - Province and district-wise filtering for operational use by police stations.
    
- A dedicated RESTful API will be deployed to manage vehicles,driver/device identities, administrative boundaries (province/district), and secure access for authorized users at Police headquarters, Provincial offices, and District/Station level. Initially, the system focuses only on vehicles visibilty and investigative logging.

- Your **main task** is to design and deploy a RESTful API necessary to achieve these objectives.

---

## Tasks
- You need to architect and design a RESTful Web API for Sri Lanka Police to fulfil the requirements of the 'initial stage' described in the business case.

- Your API should address the needs of:  
  - Central administrators (HQ/provincial control)  
  - Police stations and authorized law enforcement users. 
  - Tuk-tuk operators / tracking devices(secure location update clients)

**Important:** You are **not required to develop any client applications**(no mobile app, no web UI, no tracking device firmware). For demonstrations, you may use **synthetic/generated data** and simulate location updates using simple tools such as **CLI scripts**(e.g., curl, Postman, or a small command-line program).

**Deliverable scope is the API only**, including endpoints, data models, security controls and evidence of API functionality using simulated data.

## Simulation:
For realistic simulation, include:
- Master data for 9 provinces and 25 districts.  
- At least 20 police stations mapped to districts.  (realistic or fictional names are fine).
- At least 200 registered tuk-tuks, each generating periodic location pings.  
- Location history for **at least one week** in advance of the demo date(include patterns).

---

## Deliverables:

What you need to deliver for the evaluation.
1. **Project Report:** A formal document detailing the project's development process.The report should include the following sections and be approximately 3000 words(executing code, references and headings).
   a. Business requirements analysis: Clarify the scope, features and system objectives with the stakeholders.
   b. Thought processes, considerations and standards followed in Design, Architecture, Implementation phases. Justify your decisions.  
   c. Appendix: Deployment details of the solution. **Mandatory**
   
    i. URL of the deployed API
    ii. API specifications [Swagger]
    iii. URLs of GitHub repositories
    iv. URLs of AI aides, generated code prompts, if any.
  d. Limitations, Scaling and Further Concerns.
2. **RESTful API:** A Restful API developed according to the standards taught in the module. SHould be developed with Node.js/ES6+ 
3. **Simulation Data:** Generated data for the demonstration.In JSON or CSV

---

## Submission
- **Project Report:** NIBM LMS. Do not include code snippets.  
- **Project Codebase:** GitHub repositories.Linked in the appendix section 

  a. Include your studentID in Readme.md
  b. Add your instructor as a collaborator - **Mandatory**.  


**Assesment:**
You will be evaluated based on several aspects with varying weights assigned to each; Please refer to the assesment rubric for more information.


## Coursework Viva:

To asses the comprehension level and ascertain that the submitted coursework has been fully understood.

- Time: **15 minutes** approximately. Interview type.  
- **Important** Need to explain design, architecture, deployment and both the client & server logic.  
- A printed copy of your report is required. No hard binding.

---

## Viva Eligibility
You are eligible for the viva if you meet ALL of the following criteria:
1. Your report must include key sections such as design, architecture, and deployment links.

2. The report's word count exceeds 2700 words (as determined by the LMS). **This is a 20-credit module, and the coursework carries 100% weight.**

3. You have shared the collaborator access of GitHub repositories with the lecturer before the deadline.

4. The API is fully deployed and operational. **No localhost hosting.**
