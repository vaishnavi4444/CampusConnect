import React, { createContext, useState, useCallback } from 'react';
import { eventsAPI, registrationAPI, getErrorMessage } from '../api/endpoints';

export const EventContext = createContext(null);

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [myEventsLoading, setMyEventsLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearAll = useCallback(() => {
    setEvents([]); setMyEvents([]); setCurrentEvent(null); setError(null);
  }, []);

  const fetchEvents = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await eventsAPI.getAll(params);
      const data = response.data?.data || response.data || [];
      setEvents(Array.isArray(data) ? data : []);
      return { success: true, data };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEventById = useCallback(async (id) => {
    setError(null);
    try {
      const response = await eventsAPI.getById(id);
      const data = response.data?.data || response.data;
      setCurrentEvent(data);
      console.log(data)
      return { success: true, data };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const fetchMyEvents = useCallback(async () => {
    setMyEventsLoading(true);
    setError(null);
    try {
      const response = await eventsAPI.getMyEvents();
      const data = response.data?.data || response.data || [];
      setMyEvents(Array.isArray(data) ? data : []);
      return { success: true, data };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setMyEventsLoading(false);
    }
  }, []);

  const createEvent = useCallback(async (eventData) => {
    setError(null);
    try {
      const response = await eventsAPI.create(eventData);
      const data = response.data?.data || response.data;
      setEvents((prev) => [data, ...prev]);
      return { success: true, data };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const updateEvent = useCallback(async (id, eventData) => {
    setError(null);
    try {
      const response = await eventsAPI.update(id, eventData);
      const data = response.data?.data || response.data;
      setEvents((prev) => prev.map((e) => (e.id === id ? data : e)));
      if (currentEvent?.id === id) setCurrentEvent(data);
      return { success: true, data };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, error: message };
    }
  }, [currentEvent]);

  const deleteEvent = useCallback(async (id) => {
    setError(null);
    try {
      await eventsAPI.delete(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      return { success: true };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const publishEvent = useCallback(async (id) => {
    setError(null);
    try {
      const response = await eventsAPI.publish(id);
      const data = response.data?.data || response.data;
      setEvents((prev) => prev.map((e) => (e.id === id ? data : e)));
      return { success: true, data };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  const registerForEvent = useCallback(async (eventId) => {
    setError(null);
    try {
      const response = await registrationAPI.register(eventId);
      const data = response.data?.data || response.data;

      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? { ...e, isRegistered: true, registeredCount: (e.registeredCount || 0) + 1 }
            : e
        )
      );
      if (currentEvent?.id === eventId) {
        setCurrentEvent((prev) => ({
          ...prev,
          isRegistered: true,
          registeredCount: (prev.registeredCount || 0) + 1,
        }));
      }
      return { success: true, data };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, error: message };
    }
  }, [currentEvent]);

  const cancelRegistration = useCallback(async (eventId) => {
    setError(null);
    try {
      await registrationAPI.cancel(eventId);

      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? { ...e, isRegistered: false, registeredCount: Math.max(0, (e.registeredCount || 1) - 1) }
            : e
        )
      );
      if (currentEvent?.id === eventId) {
        setCurrentEvent((prev) => ({
          ...prev,
          isRegistered: false,
          registeredCount: Math.max(0, (prev.registeredCount || 1) - 1),
        }));
      }
      setMyEvents((prev) => prev.filter((e) => e.id !== eventId));
      return { success: true };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, error: message };
    }
  }, [currentEvent]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <EventContext.Provider
      value={{
        events,
        myEvents,
        currentEvent,
        loading,
        myEventsLoading,
        error,
        fetchEvents,
        fetchEventById,
        fetchMyEvents,
        createEvent,
        updateEvent,
        deleteEvent,
        publishEvent,
        registerForEvent,
        cancelRegistration,
        clearError,
        clearAll
      }}
    >
      {children}
    </EventContext.Provider>
  );
}
