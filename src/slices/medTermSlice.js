import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { doc, getDocs, writeBatch, collection } from "firebase/firestore";
import { db } from "../firestore/firebase";

const batch = writeBatch(db);

//update terms in firestore db
export const updateTermsInDb = createAsyncThunk(
  "medTerms/updateTermsInDb",
  async (data) => {
    // save new terms
    const newitems = data
      .filter((item) => item.action === "N")
      .map(({ id, medTerm, easyDefinition, fullDefinition }) => ({
        id,
        medTerm,
        easyDefinition,
        fullDefinition,
      }));

    if (newitems) {
      await newitems.forEach((term) => {
        const docRef = doc(db, "MedTerms", term.id);

        batch.set(docRef, term);
      });
    }

    //save updated items
    const updateditems = data
      .filter((item) => item.action === "U")
      .map(({ id, medTerm, easyDefinition, fullDefinition }) => ({
        id,
        medTerm,
        easyDefinition,
        fullDefinition,
      }));

    if (updateditems) {
      await updateditems.forEach((term) => {
        const docRef = doc(db, "MedTerms", term.id);

        batch.update(docRef, term);
      });
    }

    await batch.commit();
  }
);

export const deleteTermsInDb = createAsyncThunk(
  "medTerms/deleteTermsInDb",
  async (deletedItems) => {
    if (deletedItems) {
      await deletedItems.forEach((id) => {
        const docRef = doc(db, "MedTerms", id);

        batch.delete(docRef, id);
      });
    }
    await batch.commit();
  }
);

// fetch medterms
export const fetchTerms = createAsyncThunk("medTerms/fetchTerms", async () => {
  const querySnapshot = await getDocs(collection(db, "MedTerms"));

  const terms = [];
  querySnapshot.forEach((term) => {
    terms.push({ id: term.id, ...term.data() });
  });
  return terms;
});

const medTermSlice = createSlice({
  name: "MedTerms",
  initialState: {
    medTermsArray: [],
    originalTerms: [],
  },
  reducers: {
    addTerms: (state, action) => {
      state.medTermsArray.unshift(action.payload);
    },
    editTerms: (state, action) => {
      state.medTermsArray = state.medTermsArray.map((item) =>
        item.id === action.payload.id ? action.payload : item
      );
    },
    filterTerms: (state, action) => {
      state.medTermsArray = action.payload;
    },
    deleteTerms: (state, action) => {
      state.medTermsArray = state.medTermsArray.filter(
        (item) => item.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTerms.fulfilled, (state, action) => {
        state.medTermsArray = action.payload;
        state.originalTerms = action.payload;
      })
      .addCase(updateTermsInDb.fulfilled, (state, action) => {})
      .addCase(deleteTermsInDb.fulfilled, (state, action) => {});
  },
});

export const { addTerms, editTerms, filterTerms, deleteTerms } =
  medTermSlice.actions;
export default medTermSlice.reducer;
