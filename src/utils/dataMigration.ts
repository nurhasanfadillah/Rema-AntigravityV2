
import { supabase } from './supabase';

/**
 * Audit and repair tool for order consistency.
 * This tool ensures all orders have a valid mitra_id.
 */
export const auditOrderConsistency = async () => {
    console.log('Starting order consistency audit...');

    // 1. Find orders with null mitra_id
    const { data: orphanedOrders, error: fetchError } = await supabase
        .from('orders')
        .select('no_pesanan')
        .is('mitra_id', null);

    if (fetchError) {
        throw new Error(`Failed to fetch orders: ${fetchError.message}`);
    }

    if (!orphanedOrders || orphanedOrders.length === 0) {
        return {
            status: 'success',
            message: 'No orphaned orders found. Data is consistent.',
            count: 0
        };
    }

    console.log(`Found ${orphanedOrders.length} orphaned orders.`);

    // 2. Identify or Create a "Default/Retail" Mitra if needed
    // For this implementation, we will try to find a mitra named 'RETAIL' or take the first active one.
    const { data: defaultMitras } = await supabase
        .from('mitra')
        .select('id')
        .eq('nama_mitra', 'RETAIL')
        .single();

    let targetMitraId = defaultMitras?.id;

    if (!targetMitraId) {
        // Create a default Retail mitra if none exists
        const { data: newMitra, error: createError } = await supabase
            .from('mitra')
            .insert([{
                nama_mitra: 'RETAIL',
                status: 'Aktif',
                kontak: '-',
                alamat: 'Retail Customer',
                limit_tagihan: 0
            }])
            .select()
            .single();

        if (createError) {
            throw new Error(`Failed to create default Retail mitra: ${createError.message}`);
        }
        targetMitraId = newMitra.id;
    }

    // 3. Update orphaned orders
    const orderIds = orphanedOrders.map(o => o.no_pesanan);
    const { error: updateError } = await supabase
        .from('orders')
        .update({ mitra_id: targetMitraId })
        .in('no_pesanan', orderIds);

    if (updateError) {
        throw new Error(`Failed to repair orders: ${updateError.message}`);
    }

    return {
        status: 'fixed',
        message: `Successfully updated ${orphanedOrders.length} orders to use Mitra ID ${targetMitraId}.`,
        count: orphanedOrders.length
    };
};
