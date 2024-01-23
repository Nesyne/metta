import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
// import "../Styles/Dashboard.css";
import { auth, db, logout } from "../firestore/firebase";
import { query, collection, getDocs, where } from "firebase/firestore";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import FileIcon from "@mui/icons-material/FileOpen";
import LogOutIcon from "@mui/icons-material/Logout";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import CssBaseline from "@mui/material/CssBaseline";
import {
  DataGrid,
  GridRowModes,
  GridRowEditStopReasons,
  GridToolbarContainer,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import { v4 as uuidv4 } from "uuid";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";

import {
  addTerms,
  editTerms,
  deleteTerms,
  updateTermsInDb,
  deleteTermsInDb,
  fetchTerms,
} from "../slices/medTermSlice";
import * as XLSX from "xlsx";

function EditToolbar(props) {
  const {
    terms,
    termsToDelete,
    dispatch,
    snackbar,
    rowModesModel,
    setRowModesModel,
    setSnackbar,
    user,
    name,
  } = props;

  // const dispatch = useDispatch();

  const [severity, setSeverity] = React.useState("success");

  const handleCloseSnackbar = () => setSnackbar(null);

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    logout();
    setAnchorEl(null);
  };

  const handleAddNewRow = () => {
    // Generate a unique ID for the new row
    const id = uuidv4();
    const newTerm = {
      id,
      medTerm: "",
      easyDefinition: "",
      fullDefinition: "",
      action: "N",
    };

    dispatch(addTerms(newTerm));

    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "medTerm" },
    }));
  };

  const handleUploadedRecords = (term, easyDef, fullDef) => {
    // Generate a unique ID for the new row
    const id = uuidv4();
    const newTerm = {
      id,
      medTerm: term,
      easyDefinition: easyDef,
      fullDefinition: fullDef,
      action: "N",
    };

    dispatch(addTerms(newTerm));

    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "medTerm" },
    }));
  };

  function openFile() {
    const fileInput = document.getElementById("fileInput");

    fileInput.addEventListener("change", function (event) {
      handleFileChange(event);
      const snick = "nick";
    });
    fileInput.click();
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });

        // Assuming you have only one sheet in the Excel file
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert the worksheet to an array of objects
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Extract columns and rows from the data
        // const cols = Object.keys(jsonData[0]).map((col) => ({
        //   field: col,
        //   headerName: col,
        //   flex: 1,
        // }));

        if (jsonData) {
          jsonData.forEach((item) => {
            handleUploadedRecords(
              item.medTerm,
              item.easyDefinition,
              item.fullDefinition
            );
          });
        }

        document.getElementById("fileInput").value = "";
      };

      reader.readAsBinaryString(file);
    }
  };

  const updateRowModesModel = (list) => {
    const itemsToUpdate = list.filter((item) =>
      terms.some((old) => item.id === old.id)
    );

    if (itemsToUpdate) {
      itemsToUpdate.forEach((item) => {
        rowModesModel[item.id].mode = GridRowModes.View;
      });
    }
  };

  const doSaveChanges = () => {
    let updatedTerms = terms.filter(
      (item) => item.action === "U" || item.action === "N"
    );

    if (updatedTerms) {
      dispatch(updateTermsInDb(updatedTerms));

      updateRowModesModel(updatedTerms);
    }

    if (termsToDelete) {
      dispatch(deleteTermsInDb(termsToDelete));
    }

    //reload
    dispatch(fetchTerms());
  };

  return (
    <div>
      {!!snackbar && (
        <Snackbar
          open
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          onClose={handleCloseSnackbar}
          autoHideDuration={2000}
        >
          <Alert onClose={handleCloseSnackbar} severity={severity}>
            {snackbar}
          </Alert>
        </Snackbar>
      )}

      <CssBaseline />

      <AppBar component="nav">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            // onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
          >
            Medical Terms Translator
          </Typography>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            {user && (
              <div>
                {name} - {user?.email}
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleClose}>Logout</MenuItem>
                  {/* <MenuItem onClick={handleClose}>My account</MenuItem> */}
                </Menu>
              </div>
              // <Button
              //   color="primary"
              //   startIcon={<LogOutIcon />}
              //   onClick={logout}
              // >
              //   Logout
              // </Button>
            )}
            {/* {navItems.map((item) => (
              <Button key={item} sx={{ color: "#fff" }}>
                {item}
              </Button>
            ))} */}
          </Box>
        </Toolbar>
      </AppBar>

      <GridToolbarContainer>
        <Button
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddNewRow}
        >
          Add New Term
        </Button>

        <Button color="primary" startIcon={<FileIcon />} onClick={openFile}>
          Upload Data From Excel
        </Button>
        <input
          type="file"
          id="fileInput"
          accept=".xlsx, .xls, .csv"
          hidden={true}
        />

        <Button
          color="primary"
          startIcon={<SaveIcon />}
          // onClick={handleSaveChanges}
          onClick={doSaveChanges}
        >
          Save Changes
        </Button>
        {/* {user && (
          <Button color="primary" startIcon={<LogOutIcon />} onClick={logout}>
            Logout
          </Button>
        )} */}
      </GridToolbarContainer>
    </div>
  );
}

function Main() {
  const terms = useSelector((state) => state.medTerms.medTermsArray);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [user, loading, error] = useAuthState(auth);
  const [name, setName] = React.useState("");

  const [rowModesModel, setRowModesModel] = React.useState({});
  const [snackbar, setSnackbar] = React.useState(null);
  const [termsToDelete, setTermsToDelete] = React.useState([]);

  const fetchUserName = async () => {
    try {
      const q = query(collection(db, "users"), where("uid", "==", user?.uid));
      const doc = await getDocs(q);
      const data = doc.docs[0].data();

      setName(data.name);
    } catch (err) {
      console.error(err);
      alert("An error occured while fetching user data");
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) return navigate("/");

    fetchUserName();
    dispatch(fetchTerms());
  }, [user, loading, dispatch]);

  // fetch medTerms
  // useEffect(() => {
  //   dispatch(fetchTerms());
  // }, [dispatch]);

  const handleDeleteClick = (id) => () => {
    if (!id) return;

    if (!termsToDelete.filter((e) => e === id).length > 0) {
      let deletedItems = termsToDelete.map(function (obj) {
        return obj;
      });

      // let deletedItems = [...termsToDelete];

      deletedItems.push(id);

      setTermsToDelete(deletedItems);

      dispatch(deleteTerms(id));
    }
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View },
    });

    // const editedRow = modifiedItems.find((row) => row.id === id);
    // if (editedRow.isNew) {
    //   // setData(data.filter((row) => row.id !== id));
    // }

    //remove edits
    // const og = allData.find((row) => row.id === id);
    // if (og) {
    //   const updatedRows = [...data];
    //   const rowIndex = updatedRows.findIndex((row) => row.id === og.id);

    //   updatedRows[rowIndex] = og;
    //   // setData(updatedRows);
    // }
  };

  const processRowUpdate = (newRow, oldRow) => {
    if (newRow === undefined) return oldRow;

    setRowModesModel({
      ...rowModesModel,
      [newRow.id]: { mode: GridRowModes.Edit },
    });

    if (newRow.action === undefined) newRow.action = "U";

    dispatch(editTerms(newRow));

    return newRow;
  };

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleProcessRowUpdateError = React.useCallback((error) => {
    // setSnackbar('{ children: error.message, severity: "error" }');
  }, []);

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns = [
    {
      field: "medTerm",
      headerName: "Medical Term",
      width: 200,
      editable: true,
    },
    {
      field: "easyDefinition",
      headerName: "Short Description",
      width: 400,
      editable: true,
    },
    {
      field: "fullDefinition",
      headerName: "Full Description",
      width: 600,
      editable: true,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      cellClassName: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<EditIcon />}
              label="Edit"
              sx={{
                color: "primary.main",
              }}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          // <GridActionsCellItem
          //   icon={<EditIcon />}
          //   label="Edit"
          //   className="textPrimary"
          //   onClick={handleEditClick(id)}
          //   color="inherit"
          // />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
    // Add more columns as needed
  ];

  return (
    <Box
      component="main"
      sx={{
        height: 960,
        width: "100%",
        "& .actions": {
          color: "text.secondary",
        },
        "& .textPrimary": {
          color: "text.primary",
        },
        p: 1,
      }}
    >
      <Toolbar />

      <DataGrid
        rows={terms}
        columns={columns}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        // onProcessRowUpdateError={handleProcessRowUpdateError}
        slots={{
          toolbar: EditToolbar,
        }}
        slotProps={{
          toolbar: {
            terms,
            termsToDelete,
            dispatch,
            snackbar,
            rowModesModel,
            setRowModesModel,
            setSnackbar,
            user,
            name,
          },
        }}
      />
    </Box>
  );
}

export default Main;
