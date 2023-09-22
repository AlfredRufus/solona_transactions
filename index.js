const {
    Connection,
    PublicKey,
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL,
    Transaction,
    SystemProgram,
    sendAndConfirmTransaction
} = require("@solana/web3.js");

const transferSol = async () => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Generate a new keypair for the sender ("from" wallet)
    const from = Keypair.generate();

    // Generate another Keypair (account we'll be sending to) for the "to" wallet
    const to = Keypair.generate();

    // Airdrop 2 SOL to Sender wallet
    console.log("Airdropping some SOL to Sender wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
        from.publicKey,
        2 * LAMPORTS_PER_SOL
    );

    // Latest blockhash (unique identifier of the block) of the cluster
    const latestBlockHash = await connection.getRecentBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction(
        fromAirDropSignature,
        "singleGossip"
    );

    console.log("Airdrop completed for the Sender account");

    // Fetch the balance of the sender's wallet
    const fromAccountInfo = await connection.getAccountInfo(from.publicKey);

    if (!fromAccountInfo) {
        console.error("Sender's account not found!");
        return;
    }

    const senderBalance = fromAccountInfo.lamports;
    const amountToSend = senderBalance / 2;

    console.log("Sender's balance:", senderBalance / LAMPORTS_PER_SOL, "SOL");
    console.log("Amount to send:", amountToSend / LAMPORTS_PER_SOL, "SOL");

    // Create a new transaction to transfer funds
    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: from.publicKey,
            toPubkey: to.publicKey,
            lamports: amountToSend
        })
    );

    // Sign and confirm the transaction
    const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [from]
    );
    console.log('Signature is', signature);
    
}

transferSol();
