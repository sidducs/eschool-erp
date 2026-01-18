import { Button, Typography } from "@mui/material";

function MuiTest() {
  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h4" gutterBottom>
        Material UI Working ✅
      </Typography>
      <Button variant="contained" color="primary">
        Test Button
      </Button>
    </div>
  );
}

export default MuiTest;
