'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { deceasedAPI } from '@/lib/api';
import Link from 'next/link';

export default function DeceasedDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateSuccess, setGenerateSuccess] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGeneratingHeadstone, setIsGeneratingHeadstone] = useState(false);
  const [isUpdatingBurial, setIsUpdatingBurial] = useState(false);
  const [showBurialModal, setShowBurialModal] = useState(false);
  const [isSendingInvoice, setIsSendingInvoice] = useState(false);
  const [isSendingCommunication, setIsSendingCommunication] = useState(false);
  const [burialFormData, setBurialFormData] = useState({
    cemetery: '',
    grave_location: '',
    date_of_burial: '',
    burial_time: '',
    mbola_cemetery_lead: '',
    prayer_talqeen_lead: '',
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['deceased', id],
    queryFn: () => deceasedAPI.getById(id),
  });

  const deceased = (data as any)?.data;

  // Generate community email HTML
  const generateCommunityEmailHTML = (deceased: any, relationships: any[]) => {
    if (!deceased || !relationships || relationships.length === 0) {
      return '';
    }

    const gender = (deceased.gender || '').toLowerCase();
    const marhoomText = gender === 'male' ? 'Marhoom' : 'Marhooma';
    
    // Build deceased name
    const deceasedNameParts = [
      deceased.first_name,
      deceased.middle_name,
      deceased.last_name
    ].filter(part => part && part.trim() !== '');
    const deceasedName = deceasedNameParts.join(' ');

    // Format date
    // The API returns dates in MM-DD-YYYY format (from ExchangeFormatDate)
    const formatDateForEmail = (dateStr: string) => {
      if (!dateStr || dateStr.trim() === '') return '';
      
      let date: Date | null = null;
      
      // Handle MM-DD-YYYY format (from ExchangeFormatDate)
      if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          const month = parseInt(parts[0]);
          const day = parseInt(parts[1]);
          const year = parseInt(parts[2]);
          
          // Check if it's MM-DD-YYYY (month first) or YYYY-MM-DD (year first)
          if (year > 31 && month <= 12 && day <= 31) {
            // YYYY-MM-DD format
            date = new Date(year, month - 1, day);
          } else if (month <= 12 && day <= 31 && year > 1900) {
            // MM-DD-YYYY format (from ExchangeFormatDate)
            date = new Date(year, month - 1, day);
          }
        }
      } else if (dateStr.includes('/')) {
        // MM/DD/YYYY format
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          const month = parseInt(parts[0]);
          const day = parseInt(parts[1]);
          const year = parseInt(parts[2]);
          if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            date = new Date(year, month - 1, day);
          }
        }
      }
      
      // If still no valid date, try standard Date parsing
      if (!date || isNaN(date.getTime())) {
        date = new Date(dateStr);
      }
      
      // Check if date is valid
      if (!date || isNaN(date.getTime())) {
        console.error('Invalid date format:', dateStr);
        return '';
      }
      
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return days[date.getDay()] + ' ' + months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
    };

    // Map relationship types to grammatical forms
    const relationshipLabels: { [key: string]: string } = {};
    if (gender === 'male') {
      Object.assign(relationshipLabels, {
        'wife': 'husband',
        'children': 'father',
        'brothers': 'brother',
        'sisters': 'brother',
        'grandsons': 'grandfather',
        'granddaughters': 'grandfather',
        'father': 'son',
        'mother': 'son',
        'nephews': 'uncle',
        'nieces': 'uncle',
        'uncle': 'nephew',
        'aunt': 'nephew',
        'cousins': 'cousin',
        'sons_in_law': 'father-in-law',
        'daughters_in_law': 'father-in-law',
        'brothers_in_law': 'brother-in-law',
        'sisters_in_law': 'brother-in-law'
      });
    } else {
      Object.assign(relationshipLabels, {
        'husband': 'wife',
        'children': 'mother',
        'brothers': 'sister',
        'sisters': 'sister',
        'grandsons': 'grandmother',
        'granddaughters': 'grandmother',
        'father': 'daughter',
        'mother': 'daughter',
        'nephews': 'aunt',
        'nieces': 'aunt',
        'uncle': 'niece',
        'aunt': 'niece',
        'cousins': 'cousin',
        'sons_in_law': 'mother-in-law',
        'daughters_in_law': 'mother-in-law',
        'brothers_in_law': 'sister-in-law',
        'sisters_in_law': 'sister-in-law'
      });
    }

    // Group relationships by type
    const groupedRelationships: { [key: string]: string[] } = {};
    relationships.forEach((rel: any) => {
      const label = relationshipLabels[rel.type] || rel.type;
      if (!groupedRelationships[label]) {
        groupedRelationships[label] = [];
      }
      if (rel.names && Array.isArray(rel.names)) {
        rel.names.forEach((name: string) => {
          groupedRelationships[label].push(name);
        });
      }
    });

    // Build relationship parts
    const relationshipParts: string[] = [];
    Object.keys(groupedRelationships).forEach((key) => {
      const names = groupedRelationships[key];
      if (names.length === 1) {
        relationshipParts.push('the ' + key + ' of ' + names[0]);
      } else {
        const namesList = names.slice(0, -1).join(', ') + ', and ' + names[names.length - 1];
        relationshipParts.push('the ' + key + ' of ' + namesList);
      }
    });

    // Join relationship parts
    let relationshipText = '';
    if (relationshipParts.length === 1) {
      relationshipText = relationshipParts[0];
    } else if (relationshipParts.length === 2) {
      relationshipText = relationshipParts[0] + ' and ' + relationshipParts[1];
    } else if (relationshipParts.length > 2) {
      relationshipText = relationshipParts.slice(0, -1).join(', ') + ', and ' + relationshipParts[relationshipParts.length - 1];
    }

    // Build email HTML
    const dateOfDeath = deceased.date_of_death || '';
    const placeOfPassing = deceased.place_of_passing || '';
    
    // Format the date of death for display
    let dateOfDeathFormatted = '';
    if (dateOfDeath) {
      const formatted = formatDateForEmail(dateOfDeath);
      if (formatted) {
        dateOfDeathFormatted = ', who passed away ' + formatted;
      }
    }
    
    let emailHTML = '<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">' +
      '<p style="text-align: center; font-size: 16px; margin-bottom: 20px; color: #000;">' +
      '<strong>Inna Lillahi wa inna ilayhi raji\'un</strong><br>' +
      '"To Allah we belong, and to Him is our return". (Al-Baqarah 2:156)' +
      '</p>' +
      '<p style="margin-bottom: 15px;">Dear community members Assalamo Alaykum,</p>' +
      '<p style="margin-bottom: 15px;">' +
      'It is with deep sorrow we announce the passing away of <strong>' + marhoomText + ' ' + deceasedName + '</strong>' +
      dateOfDeathFormatted +
      (placeOfPassing ? ' in ' + placeOfPassing : '') +
      '.' +
      '</p>';

    if (relationshipText) {
      emailHTML += '<p style="margin-bottom: 15px;">' +
        marhoomText + ' was ' + relationshipText + '.' +
        '</p>';
    }

    // Check if burial details exist
    const dateOfBurial = deceased.date_of_burial || '';
    const burialTime = deceased.burial_time || '';
    const cemetery = deceased.cemetery || '';
    
    // Map cemetery names to addresses
    const getCemeteryAddress = (cemeteryName: string) => {
      if (cemeteryName.includes('Wadi-e-Hussain') || cemeteryName.includes('Pomona')) {
        return '502 E Franklin Ave, Pomona, CA 91766';
      } else if (cemeteryName.includes('Wadi-us-Salam') || cemeteryName.includes('La Verne')) {
        return '3201 B St, La Verne, CA 91750';
      }
      return '';
    };
    
    const cemeteryAddress = getCemeteryAddress(cemetery);
    const hasBurialDetails = dateOfBurial && cemetery;
    
    // Build prayer request text
    let prayerRequestText = 'Momineen are requested to recite Sura-e-Fateha and perform Namaaz Hadiya Mayyit (anytime)';
    if (hasBurialDetails) {
      const burialDateFormatted = formatDateForEmail(dateOfBurial);
      if (burialDateFormatted) {
        // Extract day name and date for Namaz-e-Wahshat
        const burialDate = formatDateForEmail(dateOfBurial);
        const burialDateParts = burialDate.split(' ');
        const burialDayName = burialDateParts[0]; // e.g., "Tuesday"
        const burialDateShort = burialDateParts.slice(1).join(' '); // e.g., "February 3, 2026"
        
        // Format date as MM/DD/YYYY for burial details
        let burialDateMMDDYYYY = '';
        if (dateOfBurial.includes('-')) {
          const parts = dateOfBurial.split('-');
          if (parts.length === 3) {
            const month = parseInt(parts[0]);
            const day = parseInt(parts[1]);
            const year = parseInt(parts[2]);
            if (year > 31 && month <= 12 && day <= 31) {
              // YYYY-MM-DD format
              burialDateMMDDYYYY = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
            } else if (month <= 12 && day <= 31 && year > 1900) {
              // MM-DD-YYYY format
              burialDateMMDDYYYY = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
            }
          }
        } else if (dateOfBurial.includes('/')) {
          burialDateMMDDYYYY = dateOfBurial;
        }
        
        prayerRequestText += ', and Namaz-e-Wahshat after Maghrabain ' + burialDayName + ' night ' + burialDateShort + ' for the ' + marhoomText + '.';
      } else {
        prayerRequestText += ' for the ' + marhoomText + '.';
      }
    } else {
      prayerRequestText += ' for the ' + marhoomText + '.';
    }
    
    emailHTML += '<p style="margin-bottom: 15px;">' +
      'May Allah SWT grant Sabr-e-Jamil and strength to the bereaved family; give rest to the departed soul in eternal peace; and grant Maghferat and a place close to the Masoomeen (AS), A\'ameen. ' +
      prayerRequestText +
      '</p>';

        // Add burial details if available
    if (hasBurialDetails) {
      const burialDateFormatted = formatDateForEmail(dateOfBurial);
      if (burialDateFormatted) {
        const burialDateParts = burialDateFormatted.split(' ');
        const burialDayName = burialDateParts[0];
        const burialDateShort = burialDateParts.slice(1).join(' ');
        
        // Format date as MM/DD/YYYY for burial details
        let burialDateMMDDYYYY = '';
        if (dateOfBurial.includes('-')) {
          const parts = dateOfBurial.split('-');
          if (parts.length === 3) {
            const month = parseInt(parts[0]);
            const day = parseInt(parts[1]);
            const year = parseInt(parts[2]);
            if (year > 31 && month <= 12 && day <= 31) {
              burialDateMMDDYYYY = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
            } else if (month <= 12 && day <= 31 && year > 1900) {
              burialDateMMDDYYYY = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
            }
          }
        } else if (dateOfBurial.includes('/')) {
          burialDateMMDDYYYY = dateOfBurial;
        }
        
        emailHTML += '<p style="margin-bottom: 15px;"><strong>Burial Details:</strong> ' + cemetery + '</p>';
        emailHTML += '<p style="margin-bottom: 10px;"><strong>Burial Date and Time:</strong> ' + burialDayName + ' ' + burialDateMMDDYYYY;
        if (burialTime) {
          emailHTML += ' @ ' + burialTime + ' IA.';
        } else {
          emailHTML += ' IA.';
        }
        emailHTML += '</p>';
        
        if (cemeteryAddress) {
          emailHTML += '<p style="margin-bottom: 15px;"><strong>Address:</strong> ' + cemeteryAddress + '</p>';
        }
        
        // Add Namaz-e-Wahshat instructions
        emailHTML += '<p style="margin-bottom: 15px;"><strong>Namaze-e-Wehshat</strong> (to be performed ' + burialDayName + ' night ' + burialDateMMDDYYYY + ' after Maghrabain)</p>';
        emailHTML += '<p style="margin-bottom: 10px;">Just like Faj\'r prayers, except,</p>';
        emailHTML += '<p style="margin-bottom: 10px;">First Rak\'at: After Sura Al-Fateha, recite Ayatul Kursi 1 time.</p>';
        emailHTML += '<p style="margin-bottom: 15px;">Second Rak\'at: After Sura Al-Fateha, recite Sura Al-Qadr 10 times.</p>';
      }
    } else {
      // No burial details - add "Burial details to follow" message
      emailHTML += '<p style="margin-bottom: 15px;"><strong>Burial details to follow</strong></p>';
    }

    emailHTML += '<p style="margin-bottom: 15px;"><strong>Namaze-e-Hadiya-e-Mayyit:</strong> (can be performed anytime for the deceased)</p>' +
      '<p style="margin-bottom: 10px;">Just like Faj\'r prayers, except</p>' +
      '<p style="margin-bottom: 10px;">First Rak\'at: After Sura Al-Fateha, recite Sura Al Qadr.</p>' +
      '<p style="margin-bottom: 15px;">Second Rak\'at: After Sura Al-Fateha, Sura Al-Kauther</p>' +
      '<p style="margin-top: 20px;">With dua,<br>MBOLA moderator</p>' +
      '</div>';

    return emailHTML;
  };

  // Populate burial form data when deceased data loads
  useEffect(() => {
    if (deceased && !showBurialModal) {
      setBurialFormData({
        cemetery: deceased.cemetery || '',
        grave_location: deceased.grave_location || '',
        date_of_burial: deceased.date_of_burial || '',
        burial_time: deceased.burial_time || '',
        mbola_cemetery_lead: deceased.mbola_cemetery_lead || '',
        prayer_talqeen_lead: deceased.prayer_talqeen_lead || '',
      });
    }
  }, [deceased, showBurialModal]);

  // Extract certificate information - prioritize dedicated database fields, fallback to JSON
  const certificateInfo = useMemo(() => {
    if (!deceased) return null;
    
    // If certificate_id is present, include certificate code and document link
    const hasLinkedCertificate = deceased.certificate_id && (deceased.certificate_code || deceased.certificate_document_link);
    
    // First, check dedicated database fields (new approach)
    if (deceased.certificate_number) {
      // Determine certificate type based on cemetery
      let certificateType = 'Unknown';
      if (deceased.cemetery) {
        if (deceased.cemetery.includes('Wadi-e-Hussain') || deceased.cemetery.includes('Pomona')) {
          certificateType = 'Wadi-e-Hussain';
        } else if (deceased.cemetery.includes('Wadi-us-Salam') || deceased.cemetery.includes('La Verne')) {
          certificateType = 'Wadi-us-Salam';
        }
      }
      
      return {
        type: certificateType,
        certificate_number: deceased.certificate_number || '',
        certificate_name: deceased.certificate_name || '',
        authorization_given: deceased.certificate_authorization === 1 || deceased.certificate_authorization === true,
        verified: deceased.certificate_verified === 1 || deceased.certificate_verified === true,
        verified_at: deceased.certificate_verified_at || null,
        verified_by: deceased.certificate_verified_by || null,
        certificate_id: deceased.certificate_id || null,
        certificate_code: deceased.certificate_code || null,
        certificate_document_link: deceased.certificate_document_link || null
      };
    }
    
    // If no certificate_number but certificate_id is linked, return basic info
    if (hasLinkedCertificate) {
      return {
        type: 'Unknown',
        certificate_number: '',
        certificate_name: '',
        authorization_given: false,
        verified: false,
        verified_at: null,
        verified_by: null,
        certificate_id: deceased.certificate_id || null,
        certificate_code: deceased.certificate_code || null,
        certificate_document_link: deceased.certificate_document_link || null
      };
    }
    
    // Fallback: Check mortuary_additional_details JSON (backward compatibility)
    if (deceased.mortuary_additional_details) {
      try {
        const details = JSON.parse(deceased.mortuary_additional_details);
        
        // Check for Wadi-e-Hussain certificate
        if (details.grave_certificate) {
          return {
            type: 'Wadi-e-Hussain',
            certificate_number: details.grave_certificate.certificate_number || '',
            certificate_name: details.grave_certificate.certificate_name || '',
            authorization_given: details.grave_certificate.authorization_given || false,
            verified: details.grave_certificate.verified || false,
            verified_at: details.grave_certificate.verified_at || null,
            verified_by: details.grave_certificate.verified_by || null,
            certificate_id: deceased.certificate_id || null,
            certificate_code: deceased.certificate_code || null,
            certificate_document_link: deceased.certificate_document_link || null
          };
        }
        
        // Check for Wadi-us-Salam certificate
        if (details.wadi_salam_certificate) {
          return {
            type: 'Wadi-us-Salam',
            certificate_number: details.wadi_salam_certificate.certificate_number || '',
            certificate_name: details.wadi_salam_certificate.certificate_name || '',
            authorization_given: details.wadi_salam_certificate.authorization_given || false,
            verified: details.wadi_salam_certificate.verified || false,
            verified_at: details.wadi_salam_certificate.verified_at || null,
            verified_by: details.wadi_salam_certificate.verified_by || null,
            certificate_id: deceased.certificate_id || null,
            certificate_code: deceased.certificate_code || null,
            certificate_document_link: deceased.certificate_document_link || null
          };
        }
      } catch (e) {
        // Invalid JSON, ignore
      }
    }
    
    // Final fallback: if certificate_id exists, return basic info
    if (deceased.certificate_id) {
      return {
        type: 'Unknown',
        certificate_number: '',
        certificate_name: '',
        authorization_given: false,
        verified: false,
        verified_at: null,
        verified_by: null,
        certificate_id: deceased.certificate_id || null,
        certificate_code: deceased.certificate_code || null,
        certificate_document_link: deceased.certificate_document_link || null
      };
    }
    
    return null;
  }, [deceased]);

  // Check if invoice exists by checking mortuary_additional_details
  const hasInvoice = useMemo(() => {
    if (!deceased) return false;
    
    // Check direct fields
    if (deceased.invoice_id || deceased.invoice_url || deceased.invoice_status || deceased.stripe_invoice_id) {
      return true;
    }
    
    // Check mortuary_additional_details JSON
    if (deceased.mortuary_additional_details) {
      try {
        const details = JSON.parse(deceased.mortuary_additional_details);
        if (details.stripe_invoice_id || details.invoice_url || details.invoice_status) {
          return true;
        }
      } catch (e) {
        // Invalid JSON, ignore
      }
    }
    
    return false;
  }, [deceased]);

  // Fetch current invoice status when page loads if invoice exists
  const { data: invoiceStatusData } = useQuery({
    queryKey: ['invoice_status', id],
    queryFn: () => deceasedAPI.getInvoiceStatus(id),
    enabled: !!deceased && !isLoading && hasInvoice,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: false, // Don't retry if it fails
  });

  // Refresh deceased data when invoice status query succeeds
  useEffect(() => {
    if (invoiceStatusData) {
      queryClient.invalidateQueries({ queryKey: ['deceased', id] });
    }
  }, [invoiceStatusData, queryClient, id]);

  const handleGenerateForms = async () => {
    console.log('Generate All Forms button clicked, deceased ID:', id);
    setIsGenerating(true);
    setGenerateError(null);
    setGenerateSuccess(null);

    try {
      console.log('Calling deceasedAPI.generateForms with ID:', id);
      const result: any = await deceasedAPI.generateForms(id);
      console.log('API response:', result);
      if (result && result.success) {
        setGenerateSuccess(`Forms generated successfully! ${result.forms_count || 0} form(s) created.`);
        // Refresh the deceased data to show the new forms
        queryClient.invalidateQueries({ queryKey: ['deceased', id] });
      } else {
        setGenerateError(result.message || 'Failed to generate forms');
        // Scroll to top to show the error message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      console.error('Error generating forms:', err);
      setGenerateError(err.message || 'Error generating forms. Please check server logs.');
      // Scroll to top to show the error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVerifyCertificate = async (verified: boolean) => {
    if (!certificateInfo) return;
    
    console.log('handleVerifyCertificate called with:', { id, verified, certificateInfo, paramsId: params.id });
    
    // Validate id
    if (!id || isNaN(id)) {
      console.error('Invalid deceased ID:', id);
      setGenerateError('Invalid deceased ID. Please refresh the page and try again.');
      return;
    }
    
    setIsVerifying(true);
    setGenerateError(null);
    setGenerateSuccess(null);
    
    try {
      console.log('Calling deceasedAPI.verifyCertificate with:', { deceasedId: id, verified });
      const response: any = await deceasedAPI.verifyCertificate(id, verified);
      console.log('verifyCertificate response:', response);
      if (response && response.success) {
        setGenerateSuccess(verified ? 'Certificate verified successfully' : 'Certificate verification removed');
        // Refetch the deceased data to update the UI
        queryClient.invalidateQueries({ queryKey: ['deceased', id] });
      } else {
        setGenerateError(response.message || 'Failed to update certificate verification');
        // Scroll to top to show the error message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error: any) {
      console.error('Error verifying certificate:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        responseData: error.response?.data,
        status: error.response?.status
      });
      
      // Extract error message from API response
      // The axios interceptor returns response.data, so check both error.response.data and error.response.data.message
      let errorMessage = 'Failed to update certificate verification';
      
      if (error.response?.data) {
        // If data is a string (HTML error page), use it
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
        // If data is an object with a message property
        else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        // If data is an object with an error property
        else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
        // If data itself is the message (some APIs return the message directly)
        else if (typeof error.response.data === 'object') {
          errorMessage = JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.log('Setting error message:', errorMessage);
      setGenerateError(errorMessage);
      
      // Scroll to top to show the error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGenerateMortuaryForm = async () => {
    console.log('Send Mortuary Form button clicked, deceased ID:', id);
    setIsGenerating(true);
    setGenerateError(null);
    setGenerateSuccess(null);

    try {
      console.log('Calling deceasedAPI.generateForms with ID:', id);
      const result: any = await deceasedAPI.generateForms(id);
      console.log('Full API response:', JSON.stringify(result, null, 2));
      console.log('API response type:', typeof result);
      console.log('API response success:', result?.success);
      console.log('API response message:', result?.message);
      console.log('API response forms:', result?.forms);
      console.log('API response forms_count:', result?.forms_count);
      console.log('API response debug:', result?.debug);
      
      // Log PDF field names if available
      if (result?.debug?.field_info) {
        console.log('=== PDF FORM FIELD NAMES ===');
        Object.keys(result.debug.field_info).forEach(formType => {
          const fieldInfo = result.debug.field_info[formType];
          console.log(`${formType.toUpperCase()} FORM FIELDS:`, {
            'Fields found in PDF': fieldInfo.pdf_fields || [],
            'Fields we tried to fill': fieldInfo.attempted_fields || [],
            'Matched fields': fieldInfo.matched_fields || [],
            'Missing fields (not in PDF)': fieldInfo.missing_fields || []
          });
        });
      }
      
      if (result && result.success) {
        const formsCount = result.forms_count || (result.forms ? Object.keys(result.forms).length : 0);
        if (formsCount > 0) {
          setGenerateSuccess(`Mortuary form generated successfully! ${formsCount} form(s) created.`);
        } else {
          // Show detailed message from server
          const debugMsg = result.debug ? JSON.stringify(result.debug, null, 2) : '';
          setGenerateError(result.message || 'Form generation completed, but no forms were created. ' + (debugMsg ? '\n' + debugMsg : 'Check server logs for details.'));
        }
        queryClient.invalidateQueries({ queryKey: ['deceased', id] });
      } else {
        setGenerateError(result?.message || 'Failed to generate mortuary form');
        // Scroll to top to show the error message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      console.error('Error generating mortuary form:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        stack: err.stack
      });
      setGenerateError(err.message || 'Error generating mortuary form. Please check server logs.');
      // Scroll to top to show the error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header title="Deceased Details" />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </>
    );
  }

  if (error || !deceased) {
    return (
      <>
        <Header title="Deceased Details" />
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p>Error loading deceased record</p>
            <p className="text-xs mt-2">{String(error)}</p>
          </div>
        </div>
      </>
    );
  }

  const filledForms = deceased.filled_forms || {};
  
  // Parse mortuary additional details and separate Stripe fields
  let mortuaryDetails: any = {};
  let invoiceDetails: any = {};
  if (deceased.mortuary_additional_details) {
    try {
      const allDetails = JSON.parse(deceased.mortuary_additional_details);
      
      // Stripe/invoice related fields
      const stripeFields = [
        'stripe_invoice_id',
        'stripe_customer_id',
        'invoice_url',
        'invoice_status',
        'needs_grave_payment',
        'needs_headstone_payment'
      ];
      
      // Separate Stripe fields from mortuary details
      Object.keys(allDetails).forEach(key => {
        if (stripeFields.includes(key)) {
          invoiceDetails[key] = allDetails[key];
        } else {
          mortuaryDetails[key] = allDetails[key];
        }
      });
    } catch (e) {
      // Invalid JSON, ignore
    }
  }
  
  // Also check if invoice fields are directly on deceased object (from API)
  if (deceased.invoice_id || deceased.invoice_url || deceased.invoice_status) {
    invoiceDetails.stripe_invoice_id = deceased.invoice_id || invoiceDetails.stripe_invoice_id;
    invoiceDetails.invoice_url = deceased.invoice_url || invoiceDetails.invoice_url;
    invoiceDetails.invoice_status = deceased.invoice_status || invoiceDetails.invoice_status;
    invoiceDetails.stripe_customer_id = deceased.stripe_customer_id || invoiceDetails.stripe_customer_id;
  }
  
  // Use latest invoice status from API if available
  const invoiceStatus: any = invoiceStatusData;
  if (invoiceStatus?.success && invoiceStatus?.invoice_status) {
    invoiceDetails.invoice_status = invoiceStatus.invoice_status;
    invoiceDetails.invoice_url = invoiceStatus.invoice_url || invoiceDetails.invoice_url;
  }

  return (
    <>
      <Header title="Deceased Details" />
      <div className="p-6">
        {/* Back button */}
        <div className="mb-6">
          <Link
            href="/deceased"
            className="inline-flex items-center text-primary hover:text-primary-dark"
          >
            ← Back to Deceased List
          </Link>
        </div>

        {/* Success/Error Messages */}
        {generateSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {generateSuccess}
          </div>
        )}

        {generateError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {generateError}
          </div>
        )}

        {/* Deceased Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-2xl font-semibold text-text-dark mb-6">Deceased Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">Full Name</label>
              <p className="text-text-dark">
                {[deceased.first_name, deceased.middle_name, deceased.last_name]
                  .filter(part => part && part.trim() !== '')
                  .join(' ') || deceased.full_name || '-'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">Date of Birth</label>
              <p className="text-text-dark">{deceased.date_of_birth || '-'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">Date of Death</label>
              <p className="text-text-dark">{deceased.date_of_death || '-'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">Gender</label>
              <p className="text-text-dark">
                {deceased.gender ? (deceased.gender === 'male' ? 'Male' : 'Female') : '-'}
              </p>
            </div>
          </div>

          {/* Additional Mortuary Details */}
          {Object.keys(mortuaryDetails).length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-text-dark mb-4">Additional Mortuary Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(mortuaryDetails).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-text-light mb-1">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                    <p className="text-text-dark">{String(value) || '-'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Invoice/Payment Information */}
        {(Object.keys(invoiceDetails).length > 0 || deceased.invoice_url || deceased.invoice_status) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-2xl font-semibold text-text-dark mb-6">Invoice/Payment Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {invoiceDetails.invoice_url && (
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Invoice</label>
                  <a
                    href={invoiceDetails.invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:text-primary-dark hover:underline"
                  >
                    View Invoice
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
              
              {invoiceDetails.invoice_status && (
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Invoice Status</label>
                  <div className="flex items-center gap-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      invoiceDetails.invoice_status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : invoiceDetails.invoice_status === 'open' || invoiceDetails.invoice_status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {invoiceDetails.invoice_status.charAt(0).toUpperCase() + invoiceDetails.invoice_status.slice(1)}
                    </span>
                    {invoiceDetails.invoice_status === 'open' && (
                      <button
                        onClick={async () => {
                          setIsSendingInvoice(true);
                          setGenerateError(null);
                          setGenerateSuccess(null);
                          try {
                            const result: any = await deceasedAPI.sendInvoiceSMS(id);
                            if (result && result.success) {
                              setGenerateSuccess('Invoice sent successfully via SMS!');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            } else {
                              setGenerateError(result.message || 'Failed to send invoice');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          } catch (error: any) {
                            const errorMessage = error.response?.data?.message || error.message || 'Failed to send invoice';
                            setGenerateError(errorMessage);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          } finally {
                            setIsSendingInvoice(false);
                          }
                        }}
                        disabled={isSendingInvoice}
                        className="px-4 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSendingInvoice ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Send Invoice
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {invoiceDetails.needs_grave_payment !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Grave Payment</label>
                  {(() => {
                    const needsPayment = invoiceDetails.needs_grave_payment === true || invoiceDetails.needs_grave_payment === 'true' || invoiceDetails.needs_grave_payment === 'yes';
                    const invoiceStatus = invoiceDetails.invoice_status?.toLowerCase();
                    
                    if (!needsPayment) {
                      // Not purchased
                      return (
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                          Not Purchased
                        </span>
                      );
                    } else if (needsPayment && invoiceStatus === 'paid') {
                      // Purchased and paid
                      return (
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          Paid
                        </span>
                      );
                    } else if (needsPayment && (invoiceStatus === 'open' || invoiceStatus === 'draft' || invoiceStatus === 'unpaid')) {
                      // Purchased but unpaid
                      return (
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                          Unpaid
                        </span>
                      );
                    } else {
                      // Default: purchased but status unknown
                      return (
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      );
                    }
                  })()}
                </div>
              )}
              
              {invoiceDetails.needs_headstone_payment !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Headstone Payment</label>
                  {(() => {
                    const needsPayment = invoiceDetails.needs_headstone_payment === true || invoiceDetails.needs_headstone_payment === 'true' || invoiceDetails.needs_headstone_payment === 'yes';
                    const invoiceStatus = invoiceDetails.invoice_status?.toLowerCase();
                    
                    if (!needsPayment) {
                      // Not purchased
                      return (
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                          Not Purchased
                        </span>
                      );
                    } else if (needsPayment && invoiceStatus === 'paid') {
                      // Purchased and paid
                      return (
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          Paid
                        </span>
                      );
                    } else if (needsPayment && (invoiceStatus === 'open' || invoiceStatus === 'draft' || invoiceStatus === 'unpaid')) {
                      // Purchased but unpaid
                      return (
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                          Unpaid
                        </span>
                      );
                    } else {
                      // Default: purchased but status unknown
                      return (
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      );
                    }
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next of Kin Information */}
        {(deceased.next_of_kin_first_name || deceased.next_of_kin_email || deceased.next_of_kin_phone) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-2xl font-semibold text-text-dark mb-6">Next of Kin Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(deceased.next_of_kin_first_name || deceased.next_of_kin_last_name) && (
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Name</label>
                  <p className="text-text-dark">
                    {`${deceased.next_of_kin_first_name || ''} ${deceased.next_of_kin_last_name || ''}`.trim() || '-'}
                  </p>
                </div>
              )}
              
              {deceased.next_of_kin_relationship && (
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Relationship</label>
                  <p className="text-text-dark">{deceased.next_of_kin_relationship}</p>
                </div>
              )}
              
              {deceased.next_of_kin_phone && (
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Phone</label>
                  <p className="text-text-dark">{deceased.next_of_kin_phone}</p>
                </div>
              )}
              
              {deceased.next_of_kin_email && (
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Email</label>
                  <p className="text-text-dark">{deceased.next_of_kin_email}</p>
                </div>
              )}
              
              {deceased.next_of_kin_address && !deceased.next_of_kin_address.includes('Mortuary:') && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-light mb-1">Address</label>
                  <p className="text-text-dark">{deceased.next_of_kin_address}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mortuary Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-text-dark">Mortuary Information</h2>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Button clicked!');
                handleGenerateMortuaryForm();
              }}
              disabled={isGenerating}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Send Mortuary Form
                </>
              )}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">Mortuary Name</label>
              <p className="text-text-dark">{deceased.mortuary_name || '-'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">Mortuary Phone Number</label>
              <p className="text-text-dark">{deceased.mortuary_phone || '-'}</p>
            </div>
          </div>

          {/* Mortuary Forms */}
          {filledForms.mortuary && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-text-dark mb-4">Mortuary Forms</h3>
              <div className="border border-gray-200 rounded-lg p-4">
                <a
                  href={`https://mbola.org/${filledForms.mortuary}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:text-primary-dark"
                >
                  View Mortuary Form PDF
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Burial Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-text-dark">Burial Information</h2>
            <button
              onClick={() => {
                setBurialFormData({
                  cemetery: deceased.cemetery || '',
                  grave_location: deceased.grave_location || '',
                  date_of_burial: deceased.date_of_burial || '',
                  burial_time: deceased.burial_time || '',
                  mbola_cemetery_lead: deceased.mbola_cemetery_lead || '',
                  prayer_talqeen_lead: deceased.prayer_talqeen_lead || '',
                });
                setShowBurialModal(true);
              }}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Update Burial Details
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">Cemetery</label>
              <p className="text-text-dark">{deceased.cemetery || '-'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">Date of Burial</label>
              <p className="text-text-dark">
                {deceased.date_of_burial || '-'}
                {deceased.burial_time && ` @ ${deceased.burial_time}`}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">Certificate Number</label>
              <p className="text-text-dark">{deceased.certificate_code || '-'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">MBOLA Cemetery Lead</label>
              <p className="text-text-dark">{deceased.mbola_cemetery_lead || '-'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">Prayer and Talqeen Lead</label>
              <p className="text-text-dark">{deceased.prayer_talqeen_lead || '-'}</p>
            </div>
          </div>

          {/* Certificate Information (for Wadi-e-Hussain or Wadi-us-Salam) */}
          {certificateInfo && (certificateInfo.certificate_number || certificateInfo.certificate_name) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-dark">
                  Grave Certificate Information ({certificateInfo.type})
                </h3>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    certificateInfo.verified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {certificateInfo.verified ? (
                      <>
                        <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Pending Verification
                      </>
                    )}
                  </span>
                  <button
                    onClick={() => handleVerifyCertificate(!certificateInfo.verified)}
                    disabled={isVerifying}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      certificateInfo.verified
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-primary text-white hover:bg-primary-dark'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isVerifying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        {certificateInfo.verified ? 'Unverifying...' : 'Verifying...'}
                      </>
                    ) : (
                      <>
                        {certificateInfo.verified ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Mark as Unverified
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Verify Certificate
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Certificate Number</label>
                  <p className="text-text-dark font-mono">{certificateInfo.certificate_number || '-'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Name on Certificate</label>
                  <p className="text-text-dark">{certificateInfo.certificate_name || '-'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Authorization Given</label>
                  <p className="text-text-dark">
                    {certificateInfo.authorization_given ? (
                      <span className="inline-flex items-center text-green-600">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Yes
                      </span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </p>
                </div>
                
                {certificateInfo.certificate_id && (
                  <div>
                    <label className="block text-sm font-medium text-text-light mb-1">Certificate (Linked)</label>
                    <p className="text-text-dark font-mono">
                      {certificateInfo.certificate_document_link ? (
                        <a
                          href={certificateInfo.certificate_document_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-dark hover:underline inline-flex items-center gap-1"
                        >
                          {certificateInfo.certificate_code || `#${certificateInfo.certificate_id}`}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        <Link 
                          href={`/certificates?search=${certificateInfo.certificate_code || certificateInfo.certificate_id}`}
                          className="text-primary hover:text-primary-dark hover:underline"
                        >
                          {certificateInfo.certificate_code || `#${certificateInfo.certificate_id}`}
                        </Link>
                      )}
                    </p>
                  </div>
                )}
                
                {certificateInfo.verified && certificateInfo.verified_at && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-light mb-1">Verified</label>
                    <p className="text-text-dark text-sm">
                      {new Date(certificateInfo.verified_at).toLocaleString()}
                      {certificateInfo.verified_by && (
                        <span className="text-text-light ml-2">by {certificateInfo.verified_by}</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Headstone Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-text-dark">Headstone Information</h2>
            <button
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Generate Headstone PDF button clicked!');
                setIsGeneratingHeadstone(true);
                setGenerateError(null);
                setGenerateSuccess(null);
                
                try {
                  const result: any = await deceasedAPI.generateHeadstonePDF(id);
                  if (result && result.success) {
                    setGenerateSuccess('Headstone PDF generated successfully!');
                    // Refresh the deceased data to show the new PDF
                    queryClient.invalidateQueries({ queryKey: ['deceased', id] });
                    // Scroll to top to show success message
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    setGenerateError(result.message || 'Failed to generate headstone PDF');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                } catch (err: any) {
                  console.error('Error generating headstone PDF:', err);
                  const errorMessage = err.response?.data?.message || err.message || 'Error generating headstone PDF';
                  setGenerateError(errorMessage);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } finally {
                  setIsGeneratingHeadstone(false);
                }
              }}
              disabled={isGeneratingHeadstone}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGeneratingHeadstone ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate PDF
                </>
              )}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deceased.headstone_name && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-light mb-1">Headstone Name</label>
                <p className="text-text-dark">{deceased.headstone_name}</p>
              </div>
            )}
            
            {deceased.headstone_arabic_inscription && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-light mb-1">Arabic Inscription</label>
                <p className="text-text-dark text-right" dir="rtl" style={{ fontFamily: 'Arial, "Arabic Typesetting", "Traditional Arabic", serif' }}>
                  {(() => {
                    // Convert number to Arabic text for display
                    const arabicMap: { [key: string]: string } = {
                      '1': 'بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
                      '2': 'إِنَّا لِلَّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ',
                    };
                    const number = String(deceased.headstone_arabic_inscription);
                    return arabicMap[number] || deceased.headstone_arabic_inscription;
                  })()}
                </p>
              </div>
            )}
          </div>

          {/* Headstone Forms */}
          {filledForms.headstone && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-text-dark mb-4">Headstone Forms</h3>
              <div className="border border-gray-200 rounded-lg p-4">
                <a
                  href={`https://mbola.org/${filledForms.headstone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:text-primary-dark"
                >
                  View Headstone Form PDF
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Community Communication Email */}
        {deceased.community_communication && (() => {
          try {
            const communityData = JSON.parse(deceased.community_communication);
            if (communityData.enabled && communityData.relationships && communityData.relationships.length > 0) {
              return (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <h2 className="text-2xl font-semibold text-text-dark mb-6">Community Communication Email</h2>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-text-light mb-2">Email Preview</label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-h-96 overflow-y-auto">
                      <div 
                        className="prose prose-sm max-w-none"
                        style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6' }}
                        dangerouslySetInnerHTML={{ 
                          __html: generateCommunityEmailHTML(deceased, communityData.relationships) 
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        setIsSendingCommunication(true);
                        setGenerateError(null);
                        setGenerateSuccess(null);
                        
                        try {
                          const result: any = await deceasedAPI.sendCommunityCommunication(id);
                          if (result && result.success) {
                            setGenerateSuccess('Community communication sent successfully! SMS sent to +17142274385');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          } else {
                            setGenerateError(result.message || 'Failed to send community communication');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        } catch (err: any) {
                          console.error('Error sending community communication:', err);
                          const errorMessage = err.response?.data?.message || err.message || 'Error sending community communication';
                          setGenerateError(errorMessage);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        } finally {
                          setIsSendingCommunication(false);
                        }
                      }}
                      disabled={isSendingCommunication}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {isSendingCommunication ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Send Communication
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            }
          } catch (e) {
            // Invalid JSON, skip
            console.error('Error parsing community_communication:', e);
          }
          return null;
        })()}
      </div>

      {/* Update Burial Details Modal */}
      {showBurialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-text-dark">Update Burial Details</h2>
                <button
                  onClick={() => setShowBurialModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsUpdatingBurial(true);
                  setGenerateError(null);
                  setGenerateSuccess(null);

                  try {
                    const result: any = await deceasedAPI.updateBurialDetails(id, burialFormData);
                    if (result && result.success) {
                      setGenerateSuccess('Burial details updated successfully!');
                      setShowBurialModal(false);
                      queryClient.invalidateQueries({ queryKey: ['deceased', id] });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      setGenerateError(result.message || 'Failed to update burial details');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  } catch (error: any) {
                    const errorMessage = error.response?.data?.message || error.message || 'Failed to update burial details';
                    setGenerateError(errorMessage);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } finally {
                    setIsUpdatingBurial(false);
                  }
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-text-light mb-1">
                      Cemetery
                    </label>
                    <input
                      type="text"
                      value={burialFormData.cemetery}
                      onChange={(e) => setBurialFormData({ ...burialFormData, cemetery: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-light mb-1">
                      Date of Burial
                    </label>
                    <input
                      type="date"
                      value={burialFormData.date_of_burial}
                      onChange={(e) => setBurialFormData({ ...burialFormData, date_of_burial: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-light mb-1">
                      Burial Time
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 2:00PM"
                      value={burialFormData.burial_time}
                      onChange={(e) => setBurialFormData({ ...burialFormData, burial_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-light mb-1">
                      MBOLA Cemetery Lead
                    </label>
                    <input
                      type="text"
                      value={burialFormData.mbola_cemetery_lead}
                      onChange={(e) => setBurialFormData({ ...burialFormData, mbola_cemetery_lead: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-light mb-1">
                      Prayer and Talqeen Lead
                    </label>
                    <input
                      type="text"
                      value={burialFormData.prayer_talqeen_lead}
                      onChange={(e) => setBurialFormData({ ...burialFormData, prayer_talqeen_lead: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBurialModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingBurial}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingBurial ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
