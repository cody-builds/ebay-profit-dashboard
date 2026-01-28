import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/lib/storage/storage-service';
import { updateTransactionProfits } from '@/lib/calculator';
import { z } from 'zod';

// Validation schema for transaction updates
const TransactionUpdateSchema = z.object({
  itemCost: z.number().min(0).optional(),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    const storageService = new StorageService();
    const transaction = await storageService.getTransaction(id);

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TRANSACTION_NOT_FOUND',
            message: `Transaction not found: ${id}`,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: transaction,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TRANSACTION_FETCH_ERROR',
          message: 'Failed to fetch transaction',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    const updateData = TransactionUpdateSchema.parse(body);

    const storageService = new StorageService();
    const transaction = await storageService.getTransaction(id);

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TRANSACTION_NOT_FOUND',
            message: `Transaction not found: ${id}`,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Update transaction with new data
    const updatedTransaction = {
      ...transaction,
      ...updateData,
      costUpdatedAt: updateData.itemCost !== undefined ? new Date() : transaction.costUpdatedAt,
      costUpdatedBy: updateData.itemCost !== undefined ? 'user' : transaction.costUpdatedBy,
    };

    // Recalculate profits if cost was updated
    const recalculatedTransaction = updateData.itemCost !== undefined 
      ? updateTransactionProfits(updatedTransaction)
      : updatedTransaction;

    await storageService.updateTransaction(recalculatedTransaction);

    return NextResponse.json({
      success: true,
      data: recalculatedTransaction,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.issues,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TRANSACTION_UPDATE_ERROR',
          message: 'Failed to update transaction',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    const storageService = new StorageService();
    const transaction = await storageService.getTransaction(id);

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TRANSACTION_NOT_FOUND',
            message: `Transaction not found: ${id}`,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    await storageService.deleteTransaction(id);

    return NextResponse.json({
      success: true,
      data: {
        id,
        message: 'Transaction deleted successfully',
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TRANSACTION_DELETE_ERROR',
          message: 'Failed to delete transaction',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}