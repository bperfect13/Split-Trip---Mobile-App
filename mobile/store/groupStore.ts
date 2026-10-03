import { create } from "zustand";

import { STORAGE_KEYS } from "../constants";
import {
  loadData,
  saveData,
} from "../services/storageService";
import { useExpenseStore } from "./expenseStore";

export type Member = {
  id: string;
  name: string;
};

export type Group = {
  id: string;
  name: string;
  ownerMemberId: string;
  members: Member[];
  createdAt: string;
  updatedAt: string;
};

type GroupStore = {
  groups: Group[];
  currentGroupId: string | null;

  setGroups: (groups: Group[]) => void;
  loadGroups: () => Promise<void>;

  addGroup: (group: Group) => Promise<void>;
  updateGroup: (group: Group) => Promise<void>;

  removeMember: (
    groupId: string,
    memberId: string
  ) => Promise<void>;

  deleteGroup: (groupId: string) => Promise<void>;

  setCurrentGroup: (
    groupId: string | null
  ) => void;
};

export const useGroupStore = create<GroupStore>(
  (set) => ({
    groups: [],
    currentGroupId: null,

    // Set groups
    setGroups: (groups) => {
      set({
        groups,
      });
    },

    // Load groups from AsyncStorage
    loadGroups: async () => {
      try {
        const groups = await loadData<Group[]>(
          STORAGE_KEYS.GROUPS
        );

        if (groups !== null) {
          set({
            groups,
          });
        }
      } catch (error) {
        console.error(
          "Failed to load groups:",
          error
        );
      }
    },

    // Add a new group
    addGroup: async (group) => {
      const currentGroups =
        useGroupStore.getState().groups;

      const updatedGroups = [
        ...currentGroups,
        group,
      ];

      // Update Zustand
      set({
        groups: updatedGroups,
      });

      // Save to AsyncStorage
      await saveData(
        STORAGE_KEYS.GROUPS,
        updatedGroups
      );
    },

    // Update an existing group
    updateGroup: async (group) => {
      const currentGroups =
        useGroupStore.getState().groups;

      const updatedGroups =
        currentGroups.map((existingGroup) =>
          existingGroup.id === group.id
            ? group
            : existingGroup
        );

      // Update Zustand
      set({
        groups: updatedGroups,
      });

      // Save to AsyncStorage
      await saveData(
        STORAGE_KEYS.GROUPS,
        updatedGroups
      );
    },

    // Remove a member from a group
    // Remove a member from a group
removeMember: async (
  groupId,
  memberId
) => {
  const currentGroups =
    useGroupStore.getState().groups;

  const targetGroup =
    currentGroups.find(
      (group) =>
        group.id === groupId
    );

  // Group does not exist
  if (!targetGroup) {
    return;
  }

  // Prevent removing the group owner
  if (
    targetGroup.ownerMemberId ===
    memberId
  ) {
    console.warn(
      "The group owner cannot be removed."
    );

    return;
  }

  const updatedGroups =
    currentGroups.map((group) => {
      if (group.id !== groupId) {
        return group;
      }

      return {
        ...group,

        members:
          group.members.filter(
            (member) =>
              member.id !== memberId
          ),

        updatedAt:
          new Date().toISOString(),
      };
    });

  // Update Zustand
  set({
    groups: updatedGroups,
  });

  // Save to AsyncStorage
  await saveData(
    STORAGE_KEYS.GROUPS,
    updatedGroups
  );
},

    // Delete a group
    deleteGroup: async (groupId) => {
      const currentGroups =
        useGroupStore.getState().groups;

      const updatedGroups =
        currentGroups.filter(
          (group) =>
            group.id !== groupId
        );

      // Update Zustand
      set({
        groups: updatedGroups,

        // Clear current group if it
        // was the deleted group
        currentGroupId:
          useGroupStore.getState()
            .currentGroupId === groupId
            ? null
            : useGroupStore.getState()
                .currentGroupId,
      });

      // Save updated groups
      await saveData(
        STORAGE_KEYS.GROUPS,
        updatedGroups
      );

      // Delete related expenses
      useExpenseStore
        .getState()
        .deleteExpensesByGroup(
          groupId
        );
    },

    // Set current group
    setCurrentGroup: (groupId) => {
      set({
        currentGroupId: groupId,
      });
    },
  })
);