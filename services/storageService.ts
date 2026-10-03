import AsyncStorage from "@react-native-async-storage/async-storage";

export async function saveData(
  key: string,
  data: unknown,
): Promise<void> {
  try {
    const jsonData = JSON.stringify(data);

    await AsyncStorage.setItem(
      key,
      jsonData,
    );

    console.log(
      "DATA SAVED:",
      key,
      jsonData,
    );
  } catch (error) {
    console.error(
      "FAILED TO SAVE DATA:",
      error,
    );

    throw error;
  }
}

export async function loadData<T>(
  key: string,
): Promise<T | null> {
  try {
    const jsonData =
      await AsyncStorage.getItem(key);

    console.log(
      "DATA LOADED:",
      key,
      jsonData,
    );

    if (jsonData === null) {
      return null;
    }

    return JSON.parse(jsonData) as T;
  } catch (error) {
    console.error(
      "FAILED TO LOAD DATA:",
      error,
    );

    throw error;
  }
}

export async function removeData(
  key: string,
): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);

    console.log(
      "DATA REMOVED:",
      key,
    );
  } catch (error) {
    console.error(
      "FAILED TO REMOVE DATA:",
      error,
    );

    throw error;
  }
}