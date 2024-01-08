# Tamper Proof Data

At Bequest, we require that important user data is tamper proof. Otherwise, our system can incorrectly distribute assets if our internal server or database is breached. 

**1. How does the client ensure that their data has not been tampered with?**
<br />
**2. If the data has been tampered with, how can the client recover the lost data?**


Edit this repo to answer these two questions using any technologies you'd like, there any many possible solutions. Feel free to add comments.

### To run the apps:
```npm run start``` in both the frontend and backend

## To make a submission:
1. Clone the repo
2. Make a PR with your changes in your repo
3. Email your github repository to robert@bequest.finance


### Prerequisites

**User Authentication:**

   - Use the default credentials for initial testing:
     - Username: `admin`
     - Password: `admin`

### 1. How does the client ensure that their data has not been tampered with

#### Encryption and Hashing

Data is stored securely by applying encryption for confidentiality and hashing for integrity verification.
1. Data is encrypted, adding a layer of confidentiality.
2. Hashing is applied to the data, creating a hash value that serves as a fingerprint for integrity verification.

#### JWT Token Authentication

1. User authentication is handled using JSON Web Tokens (JWT). Only authenticated users with valid tokens can access and modify data.

#### Access Control

1. Access to data is controlled by requiring user authentication, and only authenticated users with the appropriate JWT token can retrieve or update data.

#### Data Update Verification

1. Before allowing a data update, the client verifies the integrity of the data by comparing the hash of the current data with the hash stored in the database. This step adds an extra layer of protection against tampering.

### 2. If the data has been tampered with, how can the client recover the lost data?

#### Data Recovery API

1. A dedicated API is available for data recovery, but it is accessible only to valid and authenticated users. This ensures that the recovery process is controlled and secure.

### 3. Verify Data Correctness

#### Hash Verification
1. To verify the correctness of data, the client can send both the original data and its encrypted version.
2. The server decrypts the encrypted data, calculates its hash, and compares it with the provided hash value. If they match, the data is considered unaltered.
