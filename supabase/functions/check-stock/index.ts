import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Product {
  id: string;
  name: string;
  stock: number;
  category: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
  timestamp: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const brevoApiKey = Deno.env.get('BREVO_API_KEY');

    // More detailed error messages for missing environment variables
    const missingVars = [];
    if (!supabaseUrl) missingVars.push('SUPABASE_URL');
    if (!supabaseKey) missingVars.push('SUPABASE_SERVICE_ROLE_KEY');
    if (!brevoApiKey) missingVars.push('BREVO_API_KEY');

    if (missingVars.length > 0) {
      const errorResponse: ErrorResponse = {
        error: 'Missing environment variables',
        details: `Required variables not set: ${missingVars.join(', ')}`,
        timestamp: new Date().toISOString()
      };
      
      return new Response(
        JSON.stringify(errorResponse),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test database connection
    const { error: connectionError } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    if (connectionError) {
      const errorResponse: ErrorResponse = {
        error: 'Database connection failed',
        details: connectionError.message,
        timestamp: new Date().toISOString()
      };
      
      return new Response(
        JSON.stringify(errorResponse),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    // Get all products with low stock (less than 10 units)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, stock, category')
      .lt('stock', 10);

    if (productsError) {
      const errorResponse: ErrorResponse = {
        error: 'Failed to fetch products',
        details: productsError.message,
        timestamp: new Date().toISOString()
      };
      
      return new Response(
        JSON.stringify(errorResponse),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No products with low stock',
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Format the email content
    const emailContent = formatEmailContent(products as Product[]);

    try {
      // Send email using Brevo
      const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            name: 'CBD Wellness Stock Alert',
            email: 'noreply@cbdwellness.com'
          },
          to: [{
            email: 'manager@cbdwellness.com',
            name: 'Stock Manager'
          }],
          subject: 'Low Stock Alert - Action Required',
          htmlContent: emailContent
        })
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        throw new Error(`Email service error: ${JSON.stringify(errorData)}`);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Low stock alert email sent',
          productsChecked: products.length,
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (emailError) {
      const errorResponse: ErrorResponse = {
        error: 'Failed to send email',
        details: emailError.message,
        timestamp: new Date().toISOString()
      };
      
      return new Response(
        JSON.stringify(errorResponse),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

  } catch (error) {
    console.error('Edge function error:', error);
    
    const errorResponse: ErrorResponse = {
      error: 'Internal server error',
      details: error.message,
      timestamp: new Date().toISOString()
    };
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function formatEmailContent(products: Product[]): string {
  const lowStockItems = products.map(product => {
    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${product.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${product.stock} units</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; color: ${product.stock === 0 ? '#ef4444' : '#f97316'};">
          ${product.stock === 0 ? 'Out of stock' : 'Low stock'}
        </td>
      </tr>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #f3f4f6; text-align: left; padding: 12px; }
          .header { background-color: #4f46e5; color: white; padding: 20px; border-radius: 8px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">CBD Wellness - Low Stock Alert</h1>
            <p style="margin: 10px 0 0 0;">The following products require attention</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Current Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${lowStockItems}
            </tbody>
          </table>

          <div class="footer">
            <p>This is an automated message. Please do not reply.</p>
            <p>CBD Wellness Stock Management System</p>
          </div>
        </div>
      </body>
    </html>
  `;
}