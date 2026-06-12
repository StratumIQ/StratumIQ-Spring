/**
 * @deprecated Use @/lib/api/fleet instead.
 * Re-exports for backward compatibility.
 */
import { fleetApi } from "@/lib/api/fleet";

export const registerEquipment = fleetApi.register;
export const listEquipment = fleetApi.list;
export const getFleetSummary = fleetApi.summary;
export const getEquipment = fleetApi.get;
export const updateEquipment = fleetApi.update;
export const updateEquipmentStatus = fleetApi.updateStatus;
export const updateEquipmentHours = fleetApi.updateHours;
export const deleteEquipment = fleetApi.delete;
export const createServiceRecord = fleetApi.createServiceRecord;
export const listServiceRecords = fleetApi.listServiceRecords;
export const updateServiceRecord = fleetApi.updateServiceRecord;
export const deleteServiceRecord = fleetApi.deleteServiceRecord;
export const logOperation = fleetApi.logOperation;
export const listOperations = fleetApi.listOperations;
