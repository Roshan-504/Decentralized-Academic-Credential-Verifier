// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AcademicCredentials {
    address public admin;

    struct Certificate {
        string studentName;
        string course;
        string year;
        string grade;
        string institute;
        string ipfsHash;
        bool isValid;
        uint256 issuedAt;
    }

    // certificateId => Certificate
    mapping(string => Certificate) public certificates;
    
    // Store all certificate IDs
    string[] public allCertificateIds;

    event CertificateIssued(
        string certificateId,
        string studentName,
        string course,
        uint256 timestamp
    );

    event CertificateRevoked(string certificateId, uint256 timestamp);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // Issue a new certificate
    function issueCertificate(
        string memory _certificateId,
        string memory _studentName,
        string memory _course,
        string memory _year,
        string memory _grade,
        string memory _institute,
        string memory _ipfsHash
    ) public onlyAdmin {
        require(bytes(_certificateId).length > 0, "Certificate ID required");
        require(certificates[_certificateId].issuedAt == 0, "Certificate already exists");

        certificates[_certificateId] = Certificate({
            studentName: _studentName,
            course: _course,
            year: _year,
            grade: _grade,
            institute: _institute,
            ipfsHash: _ipfsHash,
            isValid: true,
            issuedAt: block.timestamp
        });

        allCertificateIds.push(_certificateId);

        emit CertificateIssued(_certificateId, _studentName, _course, block.timestamp);
    }

    // Verify a certificate
    function verifyCertificate(string memory _certificateId)
        public
        view
        returns (
            string memory studentName,
            string memory course,
            string memory year,
            string memory grade,
            string memory institute,
            string memory ipfsHash,
            bool isValid,
            uint256 issuedAt
        )
    {
        Certificate memory cert = certificates[_certificateId];
        require(cert.issuedAt != 0, "Certificate does not exist");

        return (
            cert.studentName,
            cert.course,
            cert.year,
            cert.grade,
            cert.institute,
            cert.ipfsHash,
            cert.isValid,
            cert.issuedAt
        );
    }

    // Revoke a certificate
    function revokeCertificate(string memory _certificateId) public onlyAdmin {
        require(certificates[_certificateId].issuedAt != 0, "Certificate does not exist");
        require(certificates[_certificateId].isValid == true, "Certificate already revoked");

        certificates[_certificateId].isValid = false;

        emit CertificateRevoked(_certificateId, block.timestamp);
    }

    // Get total number of certificates
    function getTotalCertificates() public view returns (uint256) {
        return allCertificateIds.length;
    }

    // Transfer admin rights (optional)
    function transferAdmin(address newAdmin) public onlyAdmin {
        require(newAdmin != address(0), "Invalid address");
        admin = newAdmin;
    }
}