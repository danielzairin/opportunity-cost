document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('newsletter-form');
  const successMessage = document.getElementById('success-message');
  
  form.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    
    try {
      // This is where you'd normally connect to your newsletter service API
      // For a minimalistic approach, we'll just simulate a successful subscription
      
      // For integration with your actual newsletter service, you would:
      // 1. Make a fetch request to your newsletter API
      // 2. Handle the response appropriately
      
      // Example for SendGrid:
      /*
      const response = await fetch('YOUR_NEWSLETTER_API_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          source: 'opportunity_cost_extension'
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to subscribe');
      }
      */
      
      // For demo purposes, we'll simulate a successful API call
      console.log('Newsletter signup for:', email);
      
      // Show success message
      form.style.display = 'none';
      successMessage.style.display = 'block';
      
      // Store subscription status in extension storage
      chrome.storage.local.set({
        'newsletter_subscribed': true,
        'newsletter_email': email
      });

      // Send this info to background script for tracking
      chrome.runtime.sendMessage({
        action: 'newsletterSignup',
        email: email
      });
      
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      alert('There was a problem subscribing you to the newsletter. Please try again.');
    }
  });
  
  // Check if already subscribed
  chrome.storage.local.get(['newsletter_subscribed'], function(result) {
    if (result.newsletter_subscribed) {
      form.style.display = 'none';
      successMessage.textContent = 'You are already subscribed to our newsletter!';
      successMessage.style.display = 'block';
    }
  });
});