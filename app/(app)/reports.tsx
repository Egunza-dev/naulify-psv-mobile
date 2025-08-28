import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
  ScrollView,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useSession } from '../../context/AuthContext';
import { Payment, getPaymentsForDateRange } from '../../services/firestore';
import { Timestamp } from 'firebase/firestore';

type Timeframe = 'today' | 'week' | 'month';

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return `KSH ${amount.toFixed(2)}`;
};

const ReportsScreen = () => {
  const { user } = useSession();
  const [activeFilter, setActiveFilter] = useState<Timeframe>('week');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Effect to fetch data whenever the filter or user changes
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      const now = new Date();
      let startDate: Date;
      const endDate = new Date(); // End of today

      switch (activeFilter) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'week':
        default:
          startDate = new Date();
          startDate.setDate(now.getDate() - now.getDay()); // Start of the week (Sunday)
          startDate.setHours(0, 0, 0, 0);
          break;
      }

      try {
        const fetchedPayments = await getPaymentsForDateRange(user.uid, startDate, endDate);
        setPayments(fetchedPayments);
      } catch (err) {
        console.error(err);
        setError('Failed to load report data. Please try again.');
        // Note: Check console for Firestore index creation link if this fails.
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, activeFilter]);

  // --- Data Processing with useMemo for performance ---

  const summaryData = useMemo(() => {
    const totalRevenue = payments.reduce((sum, p) => sum + p.amountPaid, 0);
    const transactionCount = payments.length;
    return { totalRevenue, transactionCount };
  }, [payments]);
  
  const chartData = useMemo(() => {
    const days = activeFilter === 'week' ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : [];
    const dailyTotals = new Array(days.length).fill(0);

    if (activeFilter === 'week') {
      payments.forEach(p => {
        const dayIndex = p.paidAt.toDate().getDay(); // Sunday = 0, Monday = 1, etc.
        dailyTotals[dayIndex] += p.amountPaid;
      });
    }
    // Logic for 'today' and 'month' charts can be added here if needed
    
    return {
      labels: days,
      datasets: [{ data: dailyTotals }],
    };
  }, [payments, activeFilter]);
  
  // --- Render Functions and Components ---

  const renderTransactionItem = ({ item }: { item: Payment }) => (
    <View style={styles.transactionItem}>
      <View>
        <Text style={styles.transactionDesc}>{item.selections[0].description} {item.selections.length > 1 ? ` & ${item.selections.length - 1} more` : ''}</Text>
        <Text style={styles.transactionDate}>{item.paidAt.toDate().toLocaleString()}</Text>
      </View>
      <Text style={styles.transactionAmount}>{formatCurrency(item.amountPaid)}</Text>
    </View>
  );

  const TimeframeFilter = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity onPress={() => setActiveFilter('today')} style={[styles.filterButton, activeFilter === 'today' && styles.activeFilter]}>
        <Text style={styles.filterText}>Today</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setActiveFilter('week')} style={[styles.filterButton, activeFilter === 'week' && styles.activeFilter]}>
        <Text style={styles.filterText}>This Week</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setActiveFilter('month')} style={[styles.filterButton, activeFilter === 'month' && styles.activeFilter]}>
        <Text style={styles.filterText}>This Month</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#fff" style={{ marginTop: 50 }} />;
    }
    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }
    if (payments.length === 0) {
      return <Text style={styles.emptyText}>No transactions found for this period.</Text>;
    }

    return (
      <>
        {/* Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Revenue ({activeFilter})</Text>
          <Text style={styles.summaryRevenue}>{formatCurrency(summaryData.totalRevenue)}</Text>
          <Text style={styles.summaryCount}>(from {summaryData.transactionCount} transactions)</Text>
        </View>

        {/* Chart Card */}
        {activeFilter === 'week' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Daily Earnings (This Week)</Text>
            <BarChart
              data={chartData}
              width={Dimensions.get('window').width - 60} // card padding
              height={220}
              yAxisLabel="KSH "
              yAxisSuffix=""
              chartConfig={chartConfig}
              verticalLabelRotation={30}
              fromZero
            />
          </View>
        )}
        
        {/* Transactions List */}
        <View style={styles.listContainer}>
          <Text style={styles.cardTitle}>Transactions ({activeFilter})</Text>
          <FlatList
            data={payments}
            renderItem={renderTransactionItem}
            keyExtractor={item => item.id}
            scrollEnabled={false} // The outer ScrollView handles scrolling
          />
        </View>
      </>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <TimeframeFilter />
      {renderContent()}
    </ScrollView>
  );
};

// --- Styles and Chart Config ---

const chartConfig = {
  backgroundColor: '#444',
  backgroundGradientFrom: '#444',
  backgroundGradientTo: '#444',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(200, 200, 200, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#ffa726',
  },
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#333' },
  filterContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 10, backgroundColor: '#2a2a2a' },
  filterButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  activeFilter: { backgroundColor: '#007bff' },
  filterText: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#444', borderRadius: 8, padding: 15, margin: 15 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  summaryRevenue: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  summaryCount: { fontSize: 14, color: '#ccc', marginTop: 5 },
  listContainer: { margin: 15 },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#555' },
  transactionDesc: { color: '#fff', fontSize: 16 },
  transactionDate: { color: '#888', fontSize: 12, marginTop: 4 },
  transactionAmount: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  errorText: { color: 'red', textAlign: 'center', marginTop: 50 },
  emptyText: { color: '#ccc', textAlign: 'center', marginTop: 50, fontSize: 16 },
});

export default ReportsScreen;
