import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';

interface CalendarNavigatorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  availableDates: Date[];
}

const CalendarNavigator: React.FC<CalendarNavigatorProps> = ({
  selectedDate,
  onDateChange,
  availableDates,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const hasMessagesOnDate = (date: Date) => {
    return availableDates.some(d => 
      d.toDateString() === date.toDateString()
    );
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    onDateChange(newDate);
  };

  const renderCalendarDay = ({ item: day }: { item: Date | null }) => {
    if (!day) {
      return <View style={styles.calendarDayEmpty} />;
    }

    const isSelected = day.toDateString() === selectedDate.toDateString();
    const hasMessages = hasMessagesOnDate(day);
    const isToday = day.toDateString() === new Date().toDateString();

    return (
      <TouchableOpacity
        style={[
          styles.calendarDay,
          isSelected && styles.calendarDaySelected,
          isToday && styles.calendarDayToday,
        ]}
        onPress={() => {
          onDateChange(day);
          setShowCalendar(false);
        }}
      >
        <Text
          style={[
            styles.calendarDayText,
            isSelected && styles.calendarDayTextSelected,
            !hasMessages && styles.calendarDayTextNoMessages,
          ]}
        >
          {day.getDate()}
        </Text>
        {hasMessages && <View style={styles.messageIndicator} />}
      </TouchableOpacity>
    );
  };

  const days = getDaysInMonth(selectedDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      <View style={styles.navigationRow}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateDay('prev')}
        >
          <Text style={styles.navButtonText}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowCalendar(true)}
        >
          <Text style={styles.dateButtonText}>{formatDate(selectedDate)}</Text>
          <Text style={styles.dateButtonSubtext}>
            {availableDates.filter(d => d.toDateString() === selectedDate.toDateString()).length} messages
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateDay('next')}
        >
          <Text style={styles.navButtonText}>→</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showCalendar}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCalendar(false)}
        >
          <View style={styles.calendarContainer}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>{formatMonthYear(selectedDate)}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCalendar(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weekDaysRow}>
              {weekDays.map(day => (
                <Text key={day} style={styles.weekDayText}>
                  {day}
                </Text>
              ))}
            </View>

            <FlatList
              data={days}
              renderItem={renderCalendarDay}
              keyExtractor={(item, index) => index.toString()}
              numColumns={7}
              scrollEnabled={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  navButtonText: {
    fontSize: 18,
    color: '#495057',
    fontWeight: '600',
  },
  dateButton: {
    flex: 1,
    marginHorizontal: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  dateButtonSubtext: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: Dimensions.get('window').width - 40,
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6c757d',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayText: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
  },
  calendarDay: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 1,
    borderRadius: 20,
    position: 'relative',
  },
  calendarDayEmpty: {
    width: 40,
    height: 40,
    margin: 1,
  },
  calendarDaySelected: {
    backgroundColor: '#007bff',
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: '#007bff',
  },
  calendarDayText: {
    fontSize: 14,
    color: '#212529',
  },
  calendarDayTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  calendarDayTextNoMessages: {
    color: '#adb5bd',
  },
  messageIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#28a745',
  },
});

export default CalendarNavigator;