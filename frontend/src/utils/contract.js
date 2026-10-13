export const CONTRACT_ADDRESS = "0x789Fe15d9Ddb574C4E29d132FF6e974771437365";

export const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_issuer", "type": "address" }
    ],
    "name": "addIssuer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "string", "name": "certificateId", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "studentName", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "program", "type": "string" },
      { "indexed": false, "internalType": "address", "name": "issuedBy", "type": "address" }
    ],
    "name": "CertificateIssued",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "string", "name": "certificateId", "type": "string" },
      { "indexed": false, "internalType": "address", "name": "revokedBy", "type": "address" }
    ],
    "name": "CertificateRevoked",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_certificateId", "type": "string" },
      { "internalType": "string", "name": "_studentName", "type": "string" },
      { "internalType": "string", "name": "_program", "type": "string" },
      { "internalType": "string", "name": "_batch", "type": "string" },
      { "internalType": "string", "name": "_department", "type": "string" },
      { "internalType": "string", "name": "_course", "type": "string" },
      { "internalType": "string", "name": "_year", "type": "string" },
      { "internalType": "string", "name": "_grade", "type": "string" },
      { "internalType": "string", "name": "_institute", "type": "string" },
      { "internalType": "string", "name": "_photoHash", "type": "string" }
    ],
    "name": "issueCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "address", "name": "issuer", "type": "address" }
    ],
    "name": "IssuerAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "address", "name": "issuer", "type": "address" }
    ],
    "name": "IssuerRemoved",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_issuer", "type": "address" }
    ],
    "name": "removeIssuer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_certificateId", "type": "string" }
    ],
    "name": "revokeCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "newAdmin", "type": "address" }
    ],
    "name": "transferSuperAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "allCertificateIds",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "authorizedIssuers",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "name": "certificates",
    "outputs": [
      { "internalType": "string", "name": "studentName", "type": "string" },
      { "internalType": "string", "name": "program", "type": "string" },
      { "internalType": "string", "name": "batch", "type": "string" },
      { "internalType": "string", "name": "department", "type": "string" },
      { "internalType": "string", "name": "course", "type": "string" },
      { "internalType": "string", "name": "year", "type": "string" },
      { "internalType": "string", "name": "grade", "type": "string" },
      { "internalType": "string", "name": "institute", "type": "string" },
      { "internalType": "string", "name": "photoHash", "type": "string" },
      { "internalType": "bool", "name": "isValid", "type": "bool" },
      { "internalType": "uint256", "name": "issuedAt", "type": "uint256" },
      { "internalType": "address", "name": "issuedBy", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalCertificates",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_addr", "type": "address" }
    ],
    "name": "isAuthorized",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "superAdmin",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_certificateId", "type": "string" }
    ],
    "name": "verifyCertificate",
    "outputs": [
      { "internalType": "string", "name": "studentName", "type": "string" },
      { "internalType": "string", "name": "program", "type": "string" },
      { "internalType": "string", "name": "batch", "type": "string" },
      { "internalType": "string", "name": "department", "type": "string" },
      { "internalType": "string", "name": "course", "type": "string" },
      { "internalType": "string", "name": "year", "type": "string" },
      { "internalType": "string", "name": "grade", "type": "string" },
      { "internalType": "string", "name": "institute", "type": "string" },
      { "internalType": "string", "name": "photoHash", "type": "string" },
      { "internalType": "bool", "name": "isValid", "type": "bool" },
      { "internalType": "uint256", "name": "issuedAt", "type": "uint256" },
      { "internalType": "address", "name": "issuedBy", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];