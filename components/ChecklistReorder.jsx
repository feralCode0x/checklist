import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@checklist_orden";

export function ChecklistReorder({ initialItems = [] }) {
  const [items, setItems] = useState(initialItems);

  // Si llegan o cambian las notas ya grabadas desde la pantalla padre
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const guardarOrden = async (updatedItems) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
    } catch (e) {
      console.error("Error guardando el orden:", e);
    }
  };

  const moveItem = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= items.length || fromIndex === toIndex) return;
    const updated = [...items];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setItems(updated);
    guardarOrden(updated);
  };

  return (
    <View style={styles.list}>
      {items.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1;
        const label = item.text ?? item.title ?? item.name ?? String(item.id);

        return (
          <View key={item.id ?? index} style={styles.row}>
            <Text style={styles.text}>{label}</Text>

            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => moveItem(index, index - 1)}
                disabled={isFirst}
                style={[styles.btn, isFirst && styles.btnDisabled]}
              >
                <Text style={styles.btnText}>▲</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => moveItem(index, index + 1)}
                disabled={isLast}
                style={[styles.btn, isLast && styles.btnDisabled]}
              >
                <Text style={styles.btnText}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  text: { flex: 1, fontSize: 16, marginRight: 8 },
  actions: { flexDirection: "row", gap: 6 },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#2563eb",
  },
  btnDisabled: { opacity: 0.35 },
  btnText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
});