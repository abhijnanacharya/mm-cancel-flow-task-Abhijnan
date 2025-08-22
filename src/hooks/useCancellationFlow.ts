// import { DownsellVariant, generateSecureVariant } from '@/utils/pricing';
// import { useState, useCallback } from 'react';

// export function useCancellationFlow(subscriptionId?: string) {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [variant, setVariant] = useState<DownsellVariant | null>(null);

//   const assignVariant = useCallback(async (newVariant: DownsellVariant) => {
//     if (!subscriptionId) return;
    
//     setLoading(true);
//     setError(null);
    
//     try {
//       const response = await fetch('/api/cancellations/assign-variant', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'X-Requested-With': 'XMLHttpRequest'
//         },
//         credentials: 'same-origin',
//         body: JSON.stringify({
//           subscriptionId,
//           variant: newVariant
//         })
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to assign variant');
//       }
      
//       setVariant(newVariant);
//     } catch (err: any) {
//       setError(err.message || 'An error occurred');
//     } finally {
//       setLoading(false);
//     }
//   }, [subscriptionId]);

//   const getVariant = useCallback(async () => {
//     if (!subscriptionId) return;
    
//     try {
//       const response = await fetch(`/api/cancellations/variant/${subscriptionId}`);
      
//       if (response.ok) {
//         const { variant: existingVariant } = await response.json();
//         setVariant(existingVariant);
//       } else if (response.status === 404) {
//         // No variant assigned yet, generate one
//         const newVariant = generateSecureVariant();
//         await assignVariant(newVariant);
//       }
//     } catch (err: any) {
//       setError(err.message || 'An error occurred');
//     }
//   }, [subscriptionId, assignVariant]);

//   return {
//     variant,
//     loading,
//     error,
//     assignVariant,
//     getVariant
//   };
// }