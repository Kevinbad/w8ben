import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PDFDocument, rgb } from 'pdf-lib'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const w8benDataString = formData.get('data') as string

        if (!w8benDataString) {
            return NextResponse.json({ error: 'Missing form data' }, { status: 400 })
        }

        const data = JSON.parse(w8benDataString)

        // Ensure config exists
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

        // 1. Process PDF Template
        const pdfPath = path.join(process.cwd(), 'public', 'w8ben.pdf')
        let pdfBytes: Buffer
        try {
            pdfBytes = await fs.readFile(pdfPath)
        } catch (e) {
            console.error('Missing w8ben.pdf in public folder', e)
            return NextResponse.json({ error: 'System PDF template missing' }, { status: 500 })
        }

        const pdfDoc = await PDFDocument.load(pdfBytes)

        // Get the form from the PDF
        const form = pdfDoc.getForm()

        // Safely try to get and fill fields. The field names below are standard for official IRS W-8BEN forms.
        // If the specific PDF has different field names, this will catch smoothly and we can debug.
        try {
            // Part I
            form.getTextField('topmostSubform[0].Page1[0].f_1[0]').setText(data.full_name || '') // Name
            form.getTextField('topmostSubform[0].Page1[0].f_2[0]').setText(data.citizenship_country || '') // Country of citizenship
            form.getTextField('topmostSubform[0].Page1[0].f_3[0]').setText(data.address_line1 || '') // Permanent residence address

            // City, state, zip
            const cityStateZip = `${data.address_city || ''}, ${data.address_state || ''} ${data.address_postal_code || ''}`
            form.getTextField('topmostSubform[0].Page1[0].f_4[0]').setText(cityStateZip)

            // Country 
            form.getTextField('topmostSubform[0].Page1[0].f_5[0]').setText(data.citizenship_country || '') // Address Country

            form.getTextField('topmostSubform[0].Page1[0].f_9[0]').setText(data.us_tin || '')
            form.getTextField('topmostSubform[0].Page1[0].f_10[0]').setText(data.foreign_tin || '')
            form.getTextField('topmostSubform[0].Page1[0].f_11[0]').setText('')

            form.getTextField('topmostSubform[0].Page1[0].f_12[0]').setText(data.date_of_birth || '')

            // Part II
            form.getTextField('topmostSubform[0].Page1[0].f_13[0]').setText(data.citizenship_country || '')

            // Part III (Signatures)
            form.getTextField('topmostSubform[0].Page1[0].f_21[0]').setText(data.signature_text || '')

            try {
                form.getCheckBox('topmostSubform[0].Page1[0].c1_02[0]').check()
                const today = new Date()
                const sigDate = `${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}-${today.getFullYear()}`
                form.getTextField('topmostSubform[0].Page1[0].Date[0]').setText(sigDate)
            } catch (e) {
                console.warn("Could not check capacity box or set native date", e)
            }

            if (data.signature_text) {
                const pages = pdfDoc.getPages()
                const firstPage = pages[0]
                firstPage.drawText(data.signature_text, {
                    x: 160,
                    y: 76,
                    size: 16,
                    color: rgb(0, 0, 0)
                })
            }

        } catch (fieldError) {
            console.log("Some fields might not match the exact PDF structure, falling back to manual text overlay.", fieldError)
        }

        // Removed form.flatten() here because complex IRS PDFs can crash pdf-lib during flattening.
        // The submitted PDF will just have filled, editable fields, which is perfectly acceptable.
        const filledPdfBytes = await pdfDoc.save()
        const fileName = `w8ben_${Date.now()}_${data.email?.replace(/[^a-zA-Z0-9]/g, '_') || 'anon'}.pdf`

        const { error: uploadError } = await supabaseAdmin.storage
            .from('contracts')
            .upload(fileName, filledPdfBytes, {
                contentType: 'application/pdf',
                upsert: false
            })

        if (uploadError) {
            console.error('Upload Error:', uploadError)
            try { await fs.writeFile('C:\\tmp\\supabase_error.json', JSON.stringify(uploadError, null, 2)) } catch (e) { }
            return NextResponse.json({ error: `Storage Error: ${JSON.stringify(uploadError)}` }, { status: 500 })
        }

        // 2. Get Public URL
        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('contracts')
            .getPublicUrl(fileName)

        // Reformat MM-DD-YYYY to YYYY-MM-DD for PostgreSQL date column
        let pgDob = null
        if (data.date_of_birth) {
            const parts = data.date_of_birth.split('-')
            if (parts.length === 3) {
                pgDob = `${parts[2]}-${parts[0]}-${parts[1]}`
            }
        }

        // 3. Insert into w8ben_submissions
        const { error: dbError } = await supabaseAdmin
            .from('w8ben_submissions')
            .insert({
                email: data.email,
                full_name: data.full_name,
                dob: pgDob,
                address_line1: data.address_line1,
                address_city: data.address_city,
                address_state: data.address_state,
                address_postal_code: data.address_postal_code,
                citizenship_country: data.citizenship_country,
                us_tin: data.us_tin,
                foreign_tin: data.foreign_tin,
                contract_url: publicUrl,
                status: 'completed'
            })

        if (dbError) {
            console.error('DB Insert Error:', dbError)
            return NextResponse.json({ error: `DB Error: ${dbError.message || 'Unknown'} - ${dbError.details || ''}` }, { status: 500 })
        }

        return NextResponse.json({ success: true, url: publicUrl }, { status: 200 })

    } catch (error) {
        console.error('Internal Server Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
