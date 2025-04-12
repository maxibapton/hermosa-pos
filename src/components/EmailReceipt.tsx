import React from 'react';
import { CartItem, Customer, PaymentInfo } from '../types';

interface EmailReceiptProps {
  items: CartItem[];
  customer?: Customer;
  payment: PaymentInfo;
  subtotal: number;
  itemDiscounts: number;
  totalDiscount?: { type: 'percentage' | 'fixed'; value: number; amount: number };
  totalVat: number;
  total: number;
  date: Date;
  saleId: string;
}

export function EmailReceipt(props: EmailReceiptProps) {
  // This function returns the HTML string that will be sent via email
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reçu de paiement - Hermosa</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #0013FF;
            margin-bottom: 10px;
          }
          .address {
            color: #666;
            margin-bottom: 5px;
          }
          .company-info {
            color: #666;
            margin-top: 15px;
            font-size: 14px;
          }
          .receipt-details {
            margin-bottom: 30px;
            border: 1px solid #eee;
            padding: 15px;
            border-radius: 5px;
          }
          .receipt-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .items-table th {
            background-color: #f8f9fa;
            padding: 10px;
            text-align: left;
            border-bottom: 2px solid #dee2e6;
          }
          .items-table td {
            padding: 10px;
            border-bottom: 1px solid #dee2e6;
          }
          .totals {
            margin-top: 20px;
            border-top: 2px solid #dee2e6;
            padding-top: 15px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .final-total {
            font-size: 18px;
            font-weight: bold;
            color: #0013FF;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 2px solid #dee2e6;
          }
          .payment-info {
            text-align: center;
            margin-top: 30px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">HERMOSA</div>
            <div class="address">BUREAU 3, 34 PLACE DU GENERAL DE GAULLE</div>
            <div class="address">59800 LILLE</div>
            <div class="company-info">
              <div>SASU au capital de 500€</div>
              <div>SIREN: 919 509 018</div>
              <div>TVA: FR35919509018</div>
            </div>
          </div>

          <div class="receipt-details">
            <div class="receipt-row">
              <span>Date:</span>
              <span>${props.date.toLocaleString()}</span>
            </div>
            <div class="receipt-row">
              <span>N° de Reçu:</span>
              <span>${props.saleId}</span>
            </div>
            ${props.customer ? `
              <div style="margin-top: 15px;">
                <div style="font-weight: bold;">Client:</div>
                <div>${props.customer.firstName} ${props.customer.lastName}</div>
                <div style="color: #666;">${props.customer.email}</div>
                ${props.customer.phone ? `<div style="color: #666;">${props.customer.phone}</div>` : ''}
              </div>
            ` : ''}
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Article</th>
                <th style="text-align: right;">Qté</th>
                <th style="text-align: right;">Prix</th>
              </tr>
            </thead>
            <tbody>
              ${props.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td style="text-align: right;">${item.quantity} ${item.unitSize || ''}</td>
                  <td style="text-align: right;">
                    ${item.discount ? `
                      <span style="text-decoration: line-through; color: #999;">${item.price.toFixed(2)}€</span><br>
                      <span>${(item.price - item.discount.amount).toFixed(2)}€</span>
                    ` : `
                      ${item.price.toFixed(2)}€
                    `}
                  </td>
                </tr>
                ${item.discount ? `
                  <tr>
                    <td colspan="2" style="color: #28a745;">
                      Remise (${item.discount.type === 'percentage' ? `${item.discount.value}%` : `${item.discount.value}€`})
                    </td>
                    <td style="text-align: right; color: #28a745;">-${item.discount.amount.toFixed(2)}€</td>
                  </tr>
                ` : ''}
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row">
              <span>Montant HT:</span>
              <span>${props.subtotal.toFixed(2)}€</span>
            </div>
            ${props.itemDiscounts > 0 ? `
              <div class="total-row" style="color: #28a745;">
                <span>Remises Articles:</span>
                <span>-${props.itemDiscounts.toFixed(2)}€</span>
              </div>
            ` : ''}
            ${props.totalDiscount ? `
              <div class="total-row" style="color: #28a745;">
                <span>Remise Totale (${
                  props.totalDiscount.type === 'percentage' 
                    ? `${props.totalDiscount.value}%` 
                    : `${props.totalDiscount.value}€`
                }):</span>
                <span>-${props.totalDiscount.amount.toFixed(2)}€</span>
              </div>
            ` : ''}
            <div class="total-row">
              <span>TVA:</span>
              <span>${props.totalVat.toFixed(2)}€</span>
            </div>
            <div class="total-row final-total">
              <span>Montant TTC:</span>
              <span>${props.total.toFixed(2)}€</span>
            </div>
          </div>

          <div class="payment-info">
            <div style="font-weight: bold; margin-bottom: 10px;">Paiement</div>
            ${props.payment.method === 'cash' ? `
              <div>Espèces: ${props.payment.cashAmount?.toFixed(2)}€</div>
            ` : props.payment.method === 'card' ? `
              <div>Carte: ${props.payment.cardAmount?.toFixed(2)}€</div>
            ` : `
              <div>Espèces: ${props.payment.cashAmount?.toFixed(2)}€</div>
              <div>Carte: ${props.payment.cardAmount?.toFixed(2)}€</div>
            `}
          </div>

          <div class="footer">
            <p>Merci de votre achat !</p>
            <p>À bientôt chez Hermosa</p>
          </div>
        </div>
      </body>
    </html>
  `;
}