import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 12, fontFamily: 'Helvetica', color: '#333' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
  brand: { fontSize: 24, fontWeight: 'bold', color: '#3b82f6' }, // Bleu primaire
  
  section: { marginBottom: 20 },
  label: { fontSize: 10, color: 'gray', marginBottom: 2 },
  value: { fontSize: 12, fontWeight: 'bold' },

  table: { display: "table", width: "auto", marginTop: 20 }, 
  tableHeader: { flexDirection: "row", backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomColor: '#eee', padding: 8 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: '#eee', padding: 8 },
  
  colProduct: { width: "50%" },
  colQty: { width: "15%", textAlign: 'center' },
  colPrice: { width: "20%", textAlign: 'right' },
  colTotal: { width: "15%", textAlign: 'right' },

  totalSection: { marginTop: 20, flexDirection: 'row', justifyContent: 'flex-end' },
  totalBox: { width: '40%' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  grandTotal: { borderTopWidth: 2, borderTopColor: '#3b82f6', paddingTop: 10, marginTop: 5 },
  grandTotalText: { fontSize: 16, fontWeight: 'bold', color: '#3b82f6' },
  
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', color: 'gray', fontSize: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 }
});

const InvoicePDF = ({ order }) => {
  // 1. FONCTION MAGIQUE : Aplatir les sous-commandes pour récupérer tous les articles
  const getAllItems = () => {
    // Si l'objet a directement des items (cas simple)
    if (order.items && order.items.length > 0) return order.items;
    
    // Si l'objet a des sous-commandes (cas marketplace)
    if (order.sub_orders && order.sub_orders.length > 0) {
      let allItems = [];
      order.sub_orders.forEach(sub => {
        if (sub.items) {
          // On ajoute le nom de la boutique pour info
          const itemsWithStore = sub.items.map(item => ({...item, store_name: sub.store_name}));
          allItems = [...allItems, ...itemsWithStore];
        }
      });
      return allItems;
    }
    return [];
  };

  const items = getAllItems();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* EN-TÊTE */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>SoloStack</Text>
            <Text style={{fontSize: 10, color: 'gray', marginTop: 5}}>Marketplace Officielle</Text>
          </View>
          <View style={{alignItems: 'flex-end'}}>
            <Text style={{fontSize: 16, fontWeight: 'bold'}}>FACTURE</Text>
            <Text style={{color: 'gray', fontSize: 10}}>#{order.id}</Text>
            <Text style={{color: 'gray', fontSize: 10}}>{new Date(order.created_at).toLocaleDateString()}</Text>
          </View>
        </View>

        {/* INFOS CLIENT */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 }}>
          <View>
            <Text style={styles.label}>Facturé à :</Text>
            <Text style={styles.value}>{order.first_name} {order.last_name}</Text>
            <Text style={{fontSize: 12}}>{order.email}</Text>
          </View>
          <View style={{alignItems: 'flex-end'}}>
             <Text style={styles.label}>Statut du paiement :</Text>
             <Text style={{color: 'green', fontWeight: 'bold'}}>{order.payment_status || 'Payé'}</Text>
          </View>
        </View>

        {/* TABLEAU PRODUITS */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colProduct, {fontWeight: 'bold', color: 'gray'}]}>Désignation</Text>
            <Text style={[styles.colQty, {fontWeight: 'bold', color: 'gray'}]}>Qté</Text>
            <Text style={[styles.colPrice, {fontWeight: 'bold', color: 'gray'}]}>Prix Unit.</Text>
            <Text style={[styles.colTotal, {fontWeight: 'bold', color: 'gray'}]}>Total</Text>
          </View>

          {items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <View style={styles.colProduct}>
                {/* Ici on gère product_title OU product OU title pour être sûr d'afficher quelque chose */}
                <Text style={{fontWeight: 'bold'}}>{item.product_title || item.product || item.title || "Produit Inconnu"}</Text>
                {item.store_name && <Text style={{fontSize: 8, color: 'gray', fontStyle: 'italic'}}>Vendu par: {item.store_name}</Text>}
              </View>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{parseFloat(item.price).toFixed(2)} €</Text>
              <Text style={styles.colTotal}>{(item.quantity * parseFloat(item.price)).toFixed(2)} €</Text>
            </View>
          ))}
        </View>

        {/* TOTAL */}
        <View style={styles.totalSection}>
          <View style={styles.totalBox}>
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={styles.grandTotalText}>Total TTC</Text>
              <Text style={styles.grandTotalText}>{parseFloat(order.total_amount).toFixed(2)} €</Text>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <Text style={styles.footer}>
          Merci de votre confiance. Pour toute question, contactez le support SoloStack.
        </Text>

      </Page>
    </Document>
  );
  
};

export default InvoicePDF;