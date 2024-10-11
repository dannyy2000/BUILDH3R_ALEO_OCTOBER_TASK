// src/index.js
const { Account, initThreadPool, ProgramManager, AleoKeyProvider, AleoKeyProviderParams } = require('aleo-sdk'); // Import Aleo SDK

/**
 * Function to verify user's vaccination record using ZKP.
 * @param {Object} healthRecord - The health record to verify.
 * @returns {Promise<void>}
 */
async function verifyVaccinationStatus(healthRecord) {
    try {
        console.log("Initializing verification for:", healthRecord);
        
        await initThreadPool(); // Initialize thread pool
        console.log("Thread pool initialized.");

        const programName = "vaccination_verification.aleo"; // Program name
        const vaccinationProgram = `
        program ${programName};

        function verify:
            input healthRecord as private; // Sensitive data kept private
            // Placeholder logic for verification
            output true as bool; // Output true for demonstration
        `;

        // Initialize the program manager
        console.log("Setting up Program Manager...");
        const programManager = new ProgramManager();
        
        // Create a temporary account for the execution of the program
        const account = new Account();
        programManager.setAccount(account);
        console.log("Account set.");

        // Create a key provider to re-use the same key for each execution
        const keyProvider = new AleoKeyProvider();
        keyProvider.useCache(true);
        programManager.setKeyProvider(keyProvider);
        console.log("Key provider set.");

        // Pre-synthesize the program keys for verification
        const inputs = [healthRecord]; // Inputs to be passed
        console.log("Synthesizing keys...");
        const keyPair = await programManager.synthesizeKeys(vaccinationProgram, "verify", inputs);
        programManager.keyProvider.cacheKeys(`${programName}:verify`, keyPair);
        console.log("Keys synthesized and cached.");

        // Set up parameters for the key provider to search for program keys
        const keyProviderParams = new AleoKeyProviderParams({ cacheKey: `${programName}:verify` });

        // Execute the verification using cached proving keys
        console.log("Running program...");
        let executionResponse = await programManager.run(
            vaccinationProgram,
            "verify",
            inputs,
            true,
            undefined,
            keyProviderParams
        );

        console.log("Program executed. Outputs:", executionResponse.getOutputs());

        // Verify the execution
        if (programManager.verifyExecution(executionResponse)) {
            console.log("Vaccination record verified without revealing personal details.");
        } else {
            console.log("Failed to verify the vaccination record.");
        }
    } catch (error) {
        console.error("An error occurred during verification:", error);
    }
}

// Example health record data
const userHealthRecord = {
    vaccination: "DiseaseX",
    date: "2023-01-15",
};

// Run the verification function
// Run the verification function
console.log("Starting verification process...");
verifyVaccinationStatus(userHealthRecord);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason); 
});
