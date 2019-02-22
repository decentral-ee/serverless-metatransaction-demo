const {
    Web3HDWalletProvider,
    MetaTransactable
} = require("./serverless-metatransaction-demo-bundle.js");

async function handler(provider, admin, contractAddress, event) {
    MetaTransactable.setProvider(provider);
    const m = await MetaTransactable.at(contractAddress);

    const errorReason = await m.validateVaultUpdateRequest.call(
        event.address, event.nonce, event.data,
        event.sig.v, event.sig.r, event.sig.s,
        { from: admin }
    );
    if (errorReason) {
        return {
            statusCode: 400,
            body: {
                success: false,
                reason: errorReason
            },
        };
    }

    try {
        const tx = await m.executeUpdateRequest(
            event.address, event.nonce, event.data,
            event.sig.v, event.sig.r, event.sig.s,
            { from: admin }
        );
        return {
            statusCode: 200,
            body: {
                success: true,
                txHash: tx.tx
            }
        };
    } catch(error) {
        return {
            statusCode: 200,
            body: {
                success: true,
                reason: "executeUpdateRequest failed",
                error
            }
        };
    }
}

exports.testHandler = async ({provider, admin, contractAddress, event}) => {
    return await handler(provider, admin, contractAddress, event);
};

exports.handler = async (event) => {
    const provider = new Web3HDWalletProvider(
        process.env.MNEMONIC,
        process.env.PROVIDER_URL, 0, 1, {
            no_nonce_tracking: true
        });
    const admin = provider.addresses[0];
    const contractAddress = process.env.CONTRACT_ADDRESS;
    return await handler(provider, admin, contractAddress, event);
};
