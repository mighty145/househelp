import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Card, CardHeader, CardContent, Avatar, Grid } from '@mui/material';
import { API_BASE_URL } from './config';

function ConnectButton({ maid }) {
  const [showPhone, setShowPhone] = useState(false);
  return (
    <>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <Button variant="contained" color="success" sx={{ mt: 1, mb: 0, minWidth: 0, width: 'auto', px: 2 }} onClick={() => setShowPhone(true)}>
          Connect
        </Button>
        {showPhone && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 6 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#4b6043" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 16.92V19a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3 5.18 2 2 0 0 1 5 3h2.09a2 2 0 0 1 2 1.72c.13 1.13.37 2.23.72 3.28a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c1.05.35 2.15.59 3.28.72A2 2 0 0 1 22 16.92z"></path></svg>
            </span>
            <Typography variant="body1" sx={{ color: '#4b6043', fontWeight: 'bold', textAlign: 'left', display: 'inline' }}>
              {maid.phone}
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );
}

export default function Login({ onLogin, onRegister, onBack }) {
  // Search bar state and filter logic
  const [searchText, setSearchText] = useState('');
  const [mobile, setMobile] = useState('');
  const [notRegistered, setNotRegistered] = useState(false);
  const [showMaids, setShowMaids] = useState(false);
  const [maids, setMaids] = useState([]);
  // Filter states
  const [filterWorkType, setFilterWorkType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStartTime, setFilterStartTime] = useState('');
  const [filterLiving, setFilterLiving] = useState('');

  const handleLogin = async () => {
    // Validation
    if (!mobile) {
      alert('Please enter your registered mobile number');
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      alert('Please enter a valid 10 digit mobile number.');
      return;
    }
    // Check registration in backend
    try {
      const response = await fetch(`${API_BASE_URL}/api/owners/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mobile })
      });
      const result = await response.json();
      if (result.status === 'success' && result.registered) {
        // Fetch maids from backend
        try {
          const maidsResponse = await fetch(`${API_BASE_URL}/api/maids`);
          const maidsJson = await maidsResponse.json();
          setMaids(Array.isArray(maidsJson.maids) ? maidsJson.maids : []);
        } catch (maidsError) {
          alert('Error fetching maids data.');
          console.error(maidsError);
        }
        setShowMaids(true);
        onLogin && onLogin(mobile);
      } else {
        setNotRegistered(true);
      }
    } catch (error) {
      alert('Error checking registration.');
      console.error(error);
    }
  };

  // Always show login form at the top
  return (
    <>
      <Box textAlign="center" mt={2}>
        <Typography variant="h6" gutterBottom>Login</Typography>
        <TextField
          label="Mobile Number(10 digit)"
          variant="outlined"
          fullWidth
          value={mobile}
          onChange={e => setMobile(e.target.value.replace(/[^0-9]/g, ''))}
          inputProps={{ maxLength: 10 }}
          style={{ marginBottom: 24 }}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          style={{ marginBottom: 16 }}
          onClick={handleLogin}
        >
          LOGIN
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          style={{ marginBottom: 16 }}
          onClick={onRegister}
        >
          REGISTER
        </Button>
        <Button
          variant="text"
          fullWidth
          onClick={onBack}
        >
          BACK TO HOME
        </Button>
        {notRegistered && (
          <Typography color="error" sx={{ mt: 2 }}>
            Mobile number not registered. Please register first.
          </Typography>
        )}
      </Box>

      {/* Show maids/features below login after login */}
      {showMaids && (
        (() => {
          // Get unique values for dropdowns
          const workTypeOptions = Array.from(new Set(maids.flatMap(m => (m.workType ? m.workType.split(',') : [])))).filter(Boolean);
          const locationOptions = Array.from(new Set(maids.flatMap(m => (m.location ? m.location.split(',') : [])))).filter(Boolean);
          const startTimeOptions = Array.from(new Set(maids.map(m => m.startTime).filter(Boolean)));
          const endTimeOptions = Array.from(new Set(maids.map(m => m.endTime).filter(Boolean)));

          // Filter logic
          const filteredMaids = maids.filter(maid => {
            const workTypeMatch = !filterWorkType || (maid.workType && maid.workType.split(',').map(w => w.trim()).includes(filterWorkType));
            const locationMatch = !filterLocation || (maid.location && maid.location.split(',').map(l => l.trim()).includes(filterLocation));
            const startTimeMatch = !filterStartTime || maid.startTime === filterStartTime;
            const livingMatch = !filterLiving || (filterLiving === 'Yes' ? maid.living === 1 || maid.living === '1' : maid.living === 0 || maid.living === '0');
            const availableMatch = maid.available === 1 || maid.available === '1';
            return workTypeMatch && locationMatch && startTimeMatch && livingMatch && availableMatch;
          });
          const searchLower = searchText.toLowerCase();
          const searchedMaids = filteredMaids.filter(maid => {
            return (
              (maid.name && maid.name.toLowerCase().includes(searchLower)) ||
              (maid.workType && maid.workType.toLowerCase().includes(searchLower)) ||
              (maid.location && maid.location.toLowerCase().includes(searchLower))
            );
          });

          return (
            <Box sx={{
              minHeight: '100vh',
              py: 4,
              background: 'linear-gradient(135deg, #f8fafc 0%, #e3f0e8 100%)',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#7c9473', letterSpacing: 1 }}>Domestic help</Typography>
                <Button variant="outlined" sx={{ borderColor: '#7c9473', color: '#7c9473', '&:hover': { borderColor: '#b2c9ab', color: '#b2c9ab' } }} onClick={() => { setShowMaids(false); setMaids([]); }}>
                  Logout
                </Button>
              </Box>
              {/* Search Bar */}
              <Box sx={{ display: 'flex', alignItems: 'center', background: 'linear-gradient(90deg, #e3f0e8 0%, #f8fafc 100%)', borderRadius: 2, px: 2, py: 1, mb: 3, boxShadow: 1, maxWidth: 600, mx: 'auto', border: '1px solid #b2c9ab' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="#7c9473" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  type="text"
                  placeholder="Search by name, profession, or location..."
                  style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '1.1rem', width: '100%', color: '#4b6043' }}
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                />
              </Box>
              {/* Filters */}
              <Box display="flex" flexWrap="wrap" gap={2} mb={4}>
                <TextField select label="Type of Work" value={filterWorkType} onChange={e => setFilterWorkType(e.target.value)} SelectProps={{ native: true }} size="small" style={{ minWidth: 170 }} InputLabelProps={{ shrink: true }}>
                  <option value="">All</option>
                  {workTypeOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                </TextField>
                <TextField select label="Location" value={filterLocation} onChange={e => setFilterLocation(e.target.value)} SelectProps={{ native: true }} size="small" style={{ minWidth: 170 }} InputLabelProps={{ shrink: true }}>
                  <option value="">All</option>
                  {locationOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                </TextField>
                <TextField select label="Available Start Time" value={filterStartTime} onChange={e => setFilterStartTime(e.target.value)} SelectProps={{ native: true }} size="small" style={{ minWidth: 170 }} InputLabelProps={{ shrink: true }}>
                  <option value="">All</option>
                  {startTimeOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                </TextField>
                <TextField select label="Living Help" value={filterLiving} onChange={e => setFilterLiving(e.target.value)} SelectProps={{ native: true }} size="small" style={{ minWidth: 170 }} InputLabelProps={{ shrink: true }}>
                  <option value="">All</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </TextField>
              </Box>
              {/* Maids List */}
              {searchedMaids.length === 0 ? (
                <Typography>No maids found.</Typography>
              ) : (
                <Grid container spacing={3} justifyContent="center">
                  {searchedMaids.map((maid, idx) => (
                    <Grid item xs={12} key={idx} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Card sx={{
                        borderRadius: 3,
                        boxShadow: 3,
                        p: 2,
                        width: 400,
                        mx: 'auto',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        position: 'relative',
                        background: 'linear-gradient(120deg, #f7fbe7 0%, #e3f0e8 100%)',
                        border: '1px solid #b2c9ab',
                      }}>
                        <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}>
                          {maid.photoPath ? (
                            <Avatar
                              src={maid.photoPath.startsWith('http') ? maid.photoPath : `${API_BASE_URL}/uploads/${maid.photoPath}`}
                              alt={maid.name}
                              sx={{ width: 56, height: 56 }}
                            />
                          ) : (
                            <Avatar sx={{ width: 56, height: 56 }}>{maid.name ? maid.name[0] : '?'}</Avatar>
                          )}
                        </Box>
                        <Box sx={{ flex: 1, position: 'relative', pl: 0, pr: 0 }}>
                          <CardHeader
                            avatar={null}
                            title={
                              <>
                                <div style={{ textAlign: 'left' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'left', wordBreak: 'break-word', color: '#4b6043' }}>{maid.name}</Typography>
                                  </div>
                                  <Typography variant="body1" sx={{ textAlign: 'left', wordBreak: 'break-word', fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 4 }}>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c9473" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 3v4M8 3v4M2 11h20"></path></svg>
                                    </span>
                                    <span style={{ fontWeight: 'normal', color: '#4b6043' }}>{maid.workType}</span>
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#7c9473', background: 'linear-gradient(120deg, #f7fbe7 0%, #e3f0e8 100%)', px: 1, borderRadius: 1, mb: 1, display: 'flex', alignItems: 'center' }}>
                                    {maid.gender === 'Female' ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c9473" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}><circle cx="12" cy="8" r="5"/><line x1="12" y1="13" x2="12" y2="21"/><line x1="9" y1="18" x2="15" y2="18"/></svg>
                                    ) : maid.gender === 'Male' ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c9473" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}><circle cx="9" cy="15" r="6"/><path d="M16 8V3h-5"/><line x1="16" y1="3" x2="21" y2="8"/></svg>
                                    ) : null}
                                    {maid.gender}
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 1, mt: 2 }}>
                                    <Typography variant="body1" sx={{ color: '#7c9473', mb: 0.5 }}><b>Preferred Location:</b> {maid.location}</Typography>
                                    <Typography variant="body1" sx={{ color: '#4b6043', mb: 0.5 }}><b>Availability -</b> {maid.startTime || ''} to {maid.endTime || ''}</Typography>
                                    {(maid.anywhere === true || maid.anywhere === 1 || maid.living === 1) && (
                                      <Typography variant="body1" sx={{ color: '#7c9473', mb: 0.5 }}><b>Living:</b> Yes</Typography>
                                    )}
                                    {maid.remarks && (
                                      <Typography variant="body1" sx={{ color: '#4b6043', mb: 0.5 }}><b>Remarks:</b> {maid.remarks}</Typography>
                                    )}
                                  </Box>
                                  <Box sx={{ width: '100%', mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <ConnectButton maid={maid} />
                                  </Box>
                                </div>
                              </>
                            }
                            subheader={null}
                            sx={{ textAlign: 'left' }}
                          />
                        </Box>
                        <CardContent sx={{ textAlign: 'left', wordBreak: 'break-word' }}>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
              <Button variant="text" color="inherit" fullWidth style={{ marginTop: 32 }} onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); onBack(); }}>
                Back to Home
              </Button>
            </Box>
          );
        })()
      )}
    </>
  );
}
