import { Transaction } from "@mysten/sui/transactions";
import { SuiAgentKit } from "../../../agent";
import { TransactionResponse } from "../../../types";

export interface IMoveCallParams {
    packageObjectId: string;
    module: string;
    function: string;
    arguments: any[];
    typeArguments?: string[];
    gasBudget?: number;
}

/**
 * Execute a generic Move call transaction
 * @param agent SuiAgentKit instance
 * @param params IMoveCallParams
 * @returns TransactionResponse
 */
export async function move_call(
    agent: SuiAgentKit,
    params: IMoveCallParams
): Promise<TransactionResponse> {
    try {
        const tx = new Transaction();

        // Set gas budget if provided
        if (params.gasBudget) {
            tx.setGasBudget(params.gasBudget);
        }

        // Handle arguments - try to detect object IDs vs pure values
        const args = params.arguments.map(arg => {
            // If arg is an object with type specification
            if (typeof arg === 'object' && arg !== null && 'type' in arg) {
                if (arg.type === 'object') {
                    return tx.object(arg.value);
                }
                if (arg.type === 'pure') {
                    return tx.pure(arg.value);
                }
            }

            // Fallback heuristic: if it looks like an object ID, treat as object
            if (typeof arg === 'string' && arg.startsWith('0x') && arg.length > 20) {
                return tx.object(arg);
            }

            // Otherwise treat as pure value
            return tx.pure(arg);
        });

        tx.moveCall({
            target: `${params.packageObjectId}::${params.module}::${params.function}`,
            arguments: args,
            typeArguments: params.typeArguments || [],
        });

        const result = await agent.client.signAndExecuteTransaction({
            transaction: tx,
            signer: agent.wallet,
            options: {
                showEffects: true,
                showEvents: true,
            },
        });

        return {
            tx_hash: result.digest,
            tx_status: result.effects?.status.status === "success" ? "success" : "failure",
        };
    } catch (error: any) {
        throw new Error(`Failed to execute move call: ${error.message}`);
    }
}
